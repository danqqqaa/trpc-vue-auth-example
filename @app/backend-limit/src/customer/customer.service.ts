import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { AppGateway } from 'src/app.gateway';
import { LimitService } from 'src/limit/limit.service';
import { Management } from 'src/management/management.model';
import { ManagementService } from 'src/management/management.service';
import { Customer } from './customer.model';
import { CreateCustomerDto, UpdateCustomerDto } from './dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectConnection('GAZELLE_REPOSITORY')
    private readonly sequelizeConnection: Sequelize,
    @InjectModel(Customer, 'GAZELLE_REPOSITORY')
    private readonly customerRepository: typeof Customer,
    @InjectModel(Management, 'GAZELLE_REPOSITORY')
    private readonly managementRepository: typeof Management,
    // private readonly limitService: LimitService,
    private readonly managementService: ManagementService,
  ) {}

  async findAll() {
    await this.customerRepository.update(
      { password: null },
      { where: { password: null } },
    );
    const [data] = await this.sequelizeConnection.query(
      'select c.*, m.name, m."isMinutes", h."monthUsed", h."monthFactLimit", h."monthPlanLimit" from "Customer" c LEFT JOIN "Hierarchy" h on c.id = h."ownerId" LEFT JOIN "Management" m on c."managementId" = m.id;',
      {},
    );
    return data;
  }

  async findAllBySubdivision(subdivision: string) {
    return this.customerRepository.findAll({ where: { subdivision } });
  }

  async findOneByPhoneNumber(phoneNumber: string) {
    const customer = await this.customerRepository.findOne({
      where: { phoneNumber: phoneNumber },
    });
    return customer;
  }

  async findOne(id: number) {
    const customer = await this.customerRepository.findOne({ where: { id } });
    return customer;
  }

  async findOneByphone(phone: string) {
    const contact = await this.customerRepository.findOne({
      where: { phoneNumber: phone },
    });
    return contact;
  }

  async findOneByPhoneNumberAndFullnameAndSubdivision(
    phoneNumber: string,
    fullname: string,
    subdivision: string,
  ) {
    const customer = await this.customerRepository.findOne({
      where: { phoneNumber, fullname, subdivision },
    });
    return customer;
  }

  async findOneOrCreateByPhoneNumberAndFullnameAndSubdivision(
    phoneNumber: string,
    fullname: string,
    subdivision: string,
    mvz: string,
  ) {
    const customer = await this.customerRepository.findOne({
      where: { phoneNumber, fullname, subdivision },
    });
    if (customer) {
      if (customer.mvz != mvz && mvz != null) {
        await customer.update({ mvz });
      }
      return customer;
    }
    const newCustomer = await this.customerRepository.create({
      phoneNumber,
      fullname,
      subdivision,
      mvz,
    });
    AppGateway.instance.customerCreate(newCustomer);
    return newCustomer;
  }

  async create(createCustomerDto: CreateCustomerDto) {
    const customer = await this.customerRepository.create(createCustomerDto);
    AppGateway.instance.customerCreate(customer);
    const management = await this.managementRepository.findOne({
      where: { subdivision: customer.subdivision },
    });
    if (management.isSubdivision && management.subdivision) {
      this.setManagement({
        id: customer.id,
        managementId: management.id,
        isSubdivision: management.isSubdivision,
        subdivision: management.subdivision,
      });
      this.managementService.bindCustomerToManagement(customer, management);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.findOne(id);
    await customer.update(updateCustomerDto);
    AppGateway.instance.customerUpdate(customer);
    const management = await this.managementRepository.findOne({
      where: { subdivision: customer.subdivision },
    });
    if (management.isSubdivision && management.subdivision) {
      this.setManagement({
        id: customer.id,
        managementId: management.id,
        isSubdivision: management.isSubdivision,
        subdivision: management.subdivision,
      });
      this.managementService.bindCustomerToManagement(customer, management);
    }
    return customer;
  }

  async delete(id: number) {
    const customer = await this.findOne(id);
    AppGateway.instance.customerDelete(customer);
    await customer.destroy();
  }

  async removeManagaments(ids: number[]) {
    await this.customerRepository.update(
      { managementId: null },
      { where: { id: ids } },
    );
  }

  async setManagement({
    id,
    managementId,
    isSubdivision,
    subdivision,
  }: {
    id: number;
    managementId: number;
    isSubdivision?: boolean;
    subdivision?: string;
  }) {
    if (!isSubdivision) {
      const customer = await this.findOne(id);
      if (customer.managementId != managementId) {
        await customer.update({ managementId });
        AppGateway.instance.customerUpdate(customer);
      }
      return;
    }
    await this.customerRepository.update(
      { managementId },
      { where: { subdivision } },
    );
  }

  async getManagementUsers(managementId: number) {
    const customers = await this.customerRepository.findAll({
      where: { managementId },
    });
    return customers.map((c) => c.id);
  }
}
