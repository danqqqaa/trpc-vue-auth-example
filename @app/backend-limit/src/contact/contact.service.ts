import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AppGateway } from 'src/app.gateway';
import { Contact } from './contact.model';
import { CreateContactDto, UpdateContactDto } from './dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact, 'GAZELLE_REPOSITORY')
    private readonly contactRepository: typeof Contact,
  ) {}

  findAll() {
    return this.contactRepository.findAll();
  }

  async findOne(id: number) {
    const contact = await this.contactRepository.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact not founded!');
    return contact;
  }

  async findOneByphone(phone: string) {
    const contact = await this.contactRepository.findOne({
      where: { phoneNumber: phone },
    });
    return contact;
  }

  async findOneOrCreateByPhoneNumberAndFullname(
    phoneNumber: string,
    fullname: string,
  ) {
    const contact = await this.contactRepository.findOne({
      where: { phoneNumber, fullname },
    });
    if (contact) return contact;
    const newContact = await this.contactRepository.create({
      phoneNumber,
      fullname,
    });
    AppGateway.instance.contactCreate(newContact);
    return newContact;
  }

  async create(createContactDto: CreateContactDto) {
    const contact = await this.contactRepository.create(createContactDto);
    AppGateway.instance.contactCreate(contact);
    return contact;
  }

  async update(id: number, updateContactDto: UpdateContactDto) {
    const contact = await this.findOne(id);
    await contact.update(updateContactDto);
    AppGateway.instance.contactUpdate(contact);
    return contact;
  }

  async delete(id: number) {
    const contact = await this.findOne(id);
    AppGateway.instance.contactDelete(contact);
    await contact.destroy();
  }
}
