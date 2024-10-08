import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Status } from './status.model';
import { CreateStatusDto, UpdateStatusDto } from './dto';

export const statuses = {
  ORDERED: {
    code: 'ORDERED',
    description: 'В очереди',
    isBusy: false,
    globalOrder: 1,
  },
  REQUEST: {
    code: 'REQUEST',
    description: 'Запрос',
    isBusy: false,
    globalOrder: 2,
  },
  WAIT: {
    code: 'WAIT',
    description: 'Подтверждение заявки',
    isBusy: false,
    globalOrder: 3,
  },
  ACCEPTED: {
    code: 'ACCEPTED',
    description: 'Заявка принята',
    isBusy: true,
    globalOrder: 4,
  },
  ENTRY_TO_CUSTOMER: {
    code: 'ENTRY_TO_CUSTOMER',
    description: 'Прибыл к заказчику', //
    isBusy: true,
    globalOrder: 5,
  },
  LOADING_START: {
    code: 'LOADING_START',
    description: 'Погрузка начата', //
    isBusy: true,
    globalOrder: 6,
  },
  LOADING_END: {
    code: 'LOADING_END',
    description: 'Погрузка завершена', //
    isBusy: true,
    globalOrder: 7,
  },
  EXIT_TO_DESTINATION: {
    code: 'EXIT_TO_DESTINATION',
    description: 'Убыл в место назначения', // 
    isBusy: true,
    globalOrder: 8,
  },
  ENTRY_TO_DESTINATION: {
    code: 'ENTRY_TO_DESTINATION',
    description: 'Прибыл в место назначения', // 
    isBusy: true,
    globalOrder: 9,
  },
  UNLOADING_START: {
    code: 'UNLOADING_START',
    description: 'Разгрузка начата', //
    isBusy: true,
    globalOrder: 10,
  },
  FREE: {
    code: 'FREE',
    description: 'Свободен', //
    isBusy: false,
    globalOrder: 11,
  },
};

@Injectable()
export class StatusService implements OnModuleInit {
  constructor(
    @InjectModel(Status, 'GAZELLE_REPOSITORY')
    private readonly statusRepository: typeof Status,
  ) {}

  onModuleInit() {
    Object.values(statuses).forEach(async (status) => {
      if (
        !(await this.statusRepository.findOne({ where: { code: status.code } }))
      ) {
        await this.statusRepository.create(status);
      }
    });
  }

  findAll() {
    return this.statusRepository.findAll();
  }

  findByCode(code: string) {
    return this.statusRepository.findOne({ where: { code } });
  }

  async findOne(id: number) {
    const status = await this.statusRepository.findOne({ where: { id } });
    if (!status) throw new NotFoundException('Status not founded!');
    return status;
  }

  create(createStatusDto: CreateStatusDto) {
    return this.statusRepository.create(createStatusDto);
  }

  async update(id: number, updateStatusDto: UpdateStatusDto) {
    const status = await this.findOne(id);
    return status.update(updateStatusDto);
  }

  async delete(id: number) {
    const status = await this.findOne(id);
    return status.destroy();
  }
}
