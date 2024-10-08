import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from 'src/customer/customer.model';
import { CustomerService } from 'src/customer/customer.service';
import { LimitService } from 'src/limit/limit.service';
import { MonthLimit } from 'src/limit/month-limit.model';
import { Order } from 'src/order/models/order.model';
import { ChangeLimitRequestStatusDto } from './dto/change-limit-request-status.dto';
import { CreateHierarchyBindingDto } from './dto/create-hierarchy-binding.dto';
import { CreateLimitRequestDto } from './dto/create-limit-request.dto';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';
import { Management } from './management.model';
import * as moment from 'moment';
import { LimitRequest } from 'src/limit/limit-request.model';
import { Sequelize } from 'sequelize-typescript';
import { AppGateway } from 'src/app.gateway';
import { OrderStats } from 'src/order/models/order-stats.model';
import { Op } from 'sequelize';
import { Control } from 'src/control/control.model';

@Injectable()
export class ManagementService {
  constructor(
    @InjectModel(Management, 'GAZELLE_REPOSITORY')
    private readonly managementRepository: typeof Management,
    @InjectModel(Order, 'GAZELLE_REPOSITORY')
    private readonly orderRepository: typeof Order,
    @InjectModel(Control, 'GAZELLE_REPOSITORY')
    private readonly controlRepository: typeof Control,
    @InjectModel(MonthLimit, 'GAZELLE_REPOSITORY')
    private readonly monthLimitRepository: typeof MonthLimit,
    @InjectModel(LimitRequest, 'GAZELLE_REPOSITORY')
    private readonly limitRequestRepository: typeof LimitRequest,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
    private readonly limitService: LimitService,
  ) { }

  async findAll(year: number, month: number) {
    return await this.managementRepository.findAll({
      order: [['name', 'asc']],
      include: [
        {
          model: MonthLimit,
          where: {
            month: month,
            year: year,
          },
          required: false,
        },
      ],
    });
  }

  async findAllWhileDriving(year: number, month: number) {
    const ml = await this.managementRepository.findAll({
      order: [['name', 'asc']],
      include: [
        {
          model: MonthLimit,
          where: {
            month: month,
            year: year,
          },
          required: false,
        },
      ],
    });
    let returnObj = {}
    for (let i = 0; i < ml.length; i++) {
      let sum = 0;
      const ids = await this.customerService.getManagementUsers(ml[i].limits[0].managementId);
      const orders = await this.orderRepository.findAll({
        attributes: ['id', 'routeLength'],
        where: {
          isDone: true,
          [Op.or]: [
            { customerId: { [Op.in]: ids } },
            // { cargoRecieverId: { [Op.in]: ids } },
          ],
          [Op.and]: [
            {
              orderTime: {
                [Op.between]: [
                  moment(`${month+1}-${year}`, 'M-YYYY')
                    .startOf('month')
                    // .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                    .format(),
                  moment(`${month+1}-${year}`, 'M-YYYY')
                    .endOf('month')
                    // .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
                    .format(),
                ],
              },
            },
            { orderTime: { [Op.not]: null } }],
        },
      }); 
      await orders.forEach((order) => {
        if (order.routeLength) {
          sum += this.limitService.metersToKilo(order.routeLength)
        }
      })
      returnObj[ml[i].id] = `${sum.toFixed(2)}`;
    }
    return returnObj
  }

  async findReserve(year: number, month: number) {
    let control = await this.controlRepository.findOne({
      where: {
        month: month,
        year: year,
      }
    });
    const months = await this.monthLimitRepository.findAll({
      where: {
        month: month,
        year: year,
      }
    });
    const ids = []
    for (let i = 0; i < months.length; i++) {
      ids.push(months[i].id)
    }
    const limitRequests = await this.limitRequestRepository.findAll({
      include: [
        {
          model: Customer,
        },
      ],
      where: {
        monthId: { [Op.in]: ids },
        approved: true,
      }
    });
    let usedMonthLimit = 0
    let usedMonthLimitCustomers = []
    for (let i = 0; i < limitRequests.length; i++) {
      usedMonthLimit += limitRequests[i].amount,
      usedMonthLimitCustomers.push({amount: limitRequests[i].amount, fullname: limitRequests[i].owner.fullname,
         phoneNumber: limitRequests[i].owner.phoneNumber, subdivision: limitRequests[i].owner.subdivision})
    }
    return {usedMonthLimit, factMonthLimit: control.productionPlanVolume, usedMonthLimitCustomers}
  }

  public async bindCustomerToManagement(
    customer: Customer,
    management: Management,
  ) {
    await this.limitService.bindCustomerToManagement(customer, management);
  }

  async spendLimit(
    order: Order,
    customer: Customer,
    stats: OrderStats,
    cargoReciever: Customer,
  ) {
    await this.limitService.spend(order, customer, stats, false);
    await this.limitService.spend(order, cargoReciever, stats, true);
  }

  async findCustomerManagement(customer: Customer) {
    if (customer.managementId == null) return null;
    const management = await this.findOne(customer.managementId);
    return management;
  }

  async findMyHierarchy(id: number) {
    const customer = await this.customerService.findOne(id);
    if (customer) return this.limitService.findHierarchy(customer);
  }

  async addToMyHierarchy(
    id: number,
    createHierarchyBindingDto: CreateHierarchyBindingDto,
  ) {
    const me = await this.customerService.findOne(id);
    const customer = await this.customerService.findOne(
      createHierarchyBindingDto.ownerId,
    );
    const management = await this.findCustomerManagement(me);
    await this.customerService.setManagement({
      id: customer.id,
      managementId: management.id,
    });
    return await this.limitService.addToMyHierarchy(
      me,
      customer,
      management,
      createHierarchyBindingDto.monthPlanLimit,
    );
  }

  async updateHierarchy(
    id: number,
    createHierarchyBindingDto: CreateHierarchyBindingDto,
  ) {
    const me = await this.customerService.findOne(id);
    const customer = await this.customerService.findOne(
      createHierarchyBindingDto.ownerId,
    );
    const management = await this.managementRepository.findOne({
      where: { id: me.managementId },
    });
    return await this.limitService.updateLimits(
      me,
      customer,
      management,
      createHierarchyBindingDto.monthPlanLimit,
    );
  }

  async findMyManagement(id: number) {
    const customer = await this.customerService.findOne(id);
    return this.findCustomerManagement(customer);
  }

  async findOne(id: number) {
    if (id == null) return;
    const management = await this.managementRepository.findOne({
      where: { id },
      include: { model: MonthLimit, where: { month: moment().month(), year: moment().year() } },
    });
    return management;
  }

  async create(createManagementDto: CreateManagementDto) {
    const management = await this.managementRepository.create({
      ...createManagementDto,
    });
    await this.customerService.setManagement({
      id: management.bossId,
      managementId: management.id,
      isSubdivision: management.isSubdivision,
      subdivision: management.subdivision,
    });
    const customer = !management.isSubdivision
      ? await this.customerService.findOne(management.bossId)
      : null;
    await this.limitService.bindBossToHierarchy({
      customer,
      management,
      monthPlanLimit: createManagementDto.defaultLimit,
      isSubdivision: management.isSubdivision,
      subdivision: management.subdivision,
    });
    // AppGateway.instance.placeCreate(management);
    const month = await this.limitService.createMonth(management);
    await this.limitService.createDay(month);
    return management;
  }

  async update(id: number, updatePlaceDto: UpdateManagementDto) {
    const management = await this.findOne(id);
    const oldBossId = management?.bossId;
    await management.update({
      name: updatePlaceDto.name,
      // defaultLimit: 68.14,
      operatingSpeedVariable: updatePlaceDto.operatingSpeedVariable,
      isMinutes: updatePlaceDto.isMinutes,
      bossId: updatePlaceDto.bossId,
      subdivision: updatePlaceDto.subdivision,
      isSubdivision: updatePlaceDto.isSubdivision
    });
    AppGateway.instance.managementUpdate(management);
    await this.customerService.setManagement({
      id: management.bossId,
      managementId: management.id,
      isSubdivision: management.isSubdivision,
      subdivision: management.subdivision,
    });
    if (!management.isSubdivision) {
      const newBoss = await this.customerService.findOne(management.bossId);
      await this.limitService.rebindBossHierarchy(oldBossId, newBoss.id);
      await this.limitService.removeCustomerHierarchy(oldBossId);
    }
    // await this.limitService.updateMonthLimit(management.id, updatePlaceDto.defaultLimit)
    // await this.limitService.updateHierarchy(management.id, updatePlaceDto.defaultLimit)
    // AppGateway.instance.placeUpdate(place);
    return management;
  }

  async delete(id: number) {
    const management = await this.findOne(id);
    const ownersIds = await this.limitService.removeMonths(management);
    await this.customerService.removeManagaments(ownersIds);
    // AppGateway.instance.placeDelete(place);
    await management.destroy();
  }

  async addLimitRequest(
    id: number,
    createLimitRequestDto: CreateLimitRequestDto,
  ) {
    const customer = await this.customerService.findOne(id);
    return await this.limitService.addLimitRequest(
      customer,
      createLimitRequestDto,
    );
  }

  async getMyHierarchyUsers(userId: number, managementId: number) {
    const management = await this.findOne(managementId);
    if (!management) return []
    return await this.limitService.getMyHierarchyUsers(userId, management);
  }
}
