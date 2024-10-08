import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transport } from './transport.model';
import { CreateTransportDto, UpdateTransportDto } from './dto';
import { User } from 'src/user/user.model';
import { Status } from 'src/status/status.model';
import { statuses, StatusService } from 'src/status/status.service';
import { AppGateway } from 'src/app.gateway';
import { Op, Sequelize } from 'sequelize';
import { Customer } from 'src/customer/customer.model';
import { Order } from 'src/order/models/order.model';
import { Contact } from 'src/contact/contact.model';
import { Place } from 'src/place/place.model';
import sequelize from 'sequelize';
import { UserService } from 'src/user/user.service';
import { OperatorShift } from 'src/user/operator-shift.model';
import { Route } from 'src/order/models/route.model';
import { TransportType } from 'src/recommendation/models/transport-type.model';

@Injectable()
export class TransportService {
  constructor(
    @InjectModel(Transport, 'GAZELLE_REPOSITORY')
    private readonly transportRepository: typeof Transport,
    @InjectModel(Order, 'GAZELLE_REPOSITORY')
    private readonly orderRepository: typeof Order,
    @InjectModel(Status, 'GAZELLE_REPOSITORY')
    private readonly statusRepository: typeof Status,
    @InjectModel(OperatorShift, 'GAZELLE_REPOSITORY')
    private readonly operatorShiftRepository: typeof OperatorShift,
    private readonly statusService: StatusService,
    @InjectModel(Route, 'GAZELLE_REPOSITORY')
    private readonly routeRepository: typeof Route,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  private async routeBuilder(
    transportId: number,
    statusIds: number[],
    ignoreStatuses: boolean = false,
  ) {
    const where = {
      transportId,
      isDeleted: false,
      isDone: false,
    };
    if (!ignoreStatuses) {
      where['statusId'] = statusIds;
    }
    const check = await this.routeRepository.findOne({
      subQuery: false,
      order: [
        [sequelize.col('Route.isEmergency'), 'desc'],
        [sequelize.col('Route.orderTime'), 'asc'],
        [sequelize.col('orders.priority'), 'asc'],
      ],
      where: { isDone: false, isDeleted: false, transportId },
      include: {
        model: Order,
        include: [
          Contact,
          {
            model: Customer,
            foreignKey: 'customerId',
            as: 'customer',
          },
          {
            model: Place,
            foreignKey: 'departurePointId',
            as: 'departurePoint',
          },
          { model: Place, foreignKey: 'destinationId', as: 'destination' },
          { model: Transport, include: [Status] },
          Status,
        ],
        where,
      },
    });

    return check;
  }

  async findDriverRoute(id: number, ignoreStatuses: boolean = false) {
    const transport = await this.findOneByDriverId(id);
    
    const routeInProgress = await this.routeBuilder(
      transport.id,
      (
        await this.statusRepository.findAll({
          where: {
            code: Object.entries(statuses)
              .filter(([key, val]) => val.isBusy)
              .map(([key, val]) => val.code),
          },
        })
      ).map((s) => s.id),
      ignoreStatuses,
    );

    if (routeInProgress && !ignoreStatuses) {
      if (transport.status.code === 'FREE')
        await this.setStatus(transport.id, 'WAIT');
      return routeInProgress;
    }
    const route = await this.routeBuilder(
      transport.id,
      (
        await this.statusRepository.findAll({
          where: {
            code: [statuses.WAIT.code],
          },
        })
      ).map((s) => s.id),
      ignoreStatuses,
    );

    if (transport.status.code === 'FREE' && route && !ignoreStatuses)
      await this.setStatus(transport.id, 'WAIT');
    return route;
  }

  private async routeLiteBuilder(transportId: number, statusIds: number[]) {
    return await this.routeRepository.findOne({
      subQuery: false,
      order: [
        [sequelize.col('Route.isEmergency'), 'desc'],
        [sequelize.col('Route.orderTime'), 'asc'],
        [sequelize.col('orders.priority'), 'asc'],
      ],
      where: { isDone: false, isDeleted: false, transportId: transportId },
      include: {
        model: Order,
        include: [{ model: Transport }, Status],
        where: {
          transportId: transportId,
          isDeleted: false,
          isDone: false,
          statusId: statusIds,
        },
      },
    });
  }

  async findDriverRouteLite(id: number) {
    const transport = await this.findOneByDriverId(id);
    const routeInProgress = await this.routeLiteBuilder(
      transport.id,
      (
        await this.statusRepository.findAll({
          where: {
            code: Object.entries(statuses)
              .filter(
                ([key, val]) =>
                  val.isBusy && val.code != statuses.ACCEPTED.code,
              )
              .map(([key, val]) => val.code),
          },
        })
      ).map((s) => s.id),
    );
    if (routeInProgress) return routeInProgress;
    const route = await this.routeLiteBuilder(
      transport.id,
      (
        await this.statusRepository.findAll({
          where: {
            code: [statuses.ACCEPTED.code, statuses.WAIT.code],
          },
        })
      ).map((s) => s.id),
    );
    if (transport.status.code === 'FREE' && route)
      await this.setStatus(transport.id, 'WAIT');
    return route;
  }

  async setPositionByUserId(userId: number, lat: number, lon: number) {
    const transport = await this.transportRepository.findOne({
      where: { driverId: userId },
    });
    if (!transport) {
      console.error('Cannot set position for user:', userId);
      return;
    }
    return await this.setPosition(transport.id, lat, lon);
  }

  async setPosition(id: number, lat: number, lon: number) {
    const point = {
      latitude: lat,
      longitude: lon,
      coordinatesChangedAt: new Date(),
    };
    await this.transportRepository.update(point, { where: { id } });
    const transport = await this.findOne(id);
    const route = await this.findDriverRouteLite(transport.driverId);
    const order = route?.findActiveOrder();
    if (order) {
      if (
        (
          await this.statusRepository.findAll({
            where: {
              code: [
                statuses.ENTRY_TO_CUSTOMER.code,
                statuses.EXIT_TO_DESTINATION.code,
              ],
            },
          })
        )
          .map((s) => s.id)
          .includes(order.transport.statusId)
      ) {
        await order.update({
          coordinatesHistory: sequelize.fn(
            'array_append',
            sequelize.col('coordinatesHistory'),
            JSON.stringify(point),
          ),
        });
      }
    } else {
      const shift = await this.userService.findCurrentShift(transport.driverId);
      if (shift)
        await shift.update({
          tempCoordinatesHistory: sequelize.fn(
            'array_append',
            sequelize.col('tempCoordinatesHistory'),
            JSON.stringify(point),
          ),
        });
    }
    AppGateway.instance.transportUpdate(transport);
  }

  public async findTransportWithStatus(statusId: number) {
    return await this.transportRepository.findAll({
      where: { statusId, isDeleted: false },
      include: [User],
    });
  }

  async clearPosition(id: number) {
    await this.transportRepository.update(
      { latitude: null, longitude: null, coordinatesChangedAt: new Date() },
      { where: { id } },
    );
    const transport = await this.findOne(id);
    AppGateway.instance.clearPositionTransport(transport);
  }

  findAll() {
    return this.transportRepository.findAll({
      include: [User],
      where: { isDeleted: false },
    });
  }

  findFree(user: any) {
    return this.transportRepository.findAll({
      where: {
        driverId: {
          [Op.or]: [null, user.id],
        },
        isDeleted: false,
      },
    });
  }

  async setLastCustomer(transportId: number, customer: Customer) {
    const transport = await this.transportRepository.findOne({
      where: { id: transportId, isDeleted: false },
    });
    await transport.update({
      lastCustomerSubdivision: customer.subdivision,
      lastCustomerPhoneNumber: customer.phoneNumber,
    });
    AppGateway.instance.transportUpdate(transport);
  }

  async setStatus(id: number, code: string) {
    const transport = await this.transportRepository.findOne({
      where: { id, isDeleted: false },
      include: [Status, TransportType],
    });
    const oldStatusChangedAt = transport.statusChangedAt;
    const newStatus = await this.statusService.findByCode(code);
    const wantedToChangeStatus = newStatus.id != transport.statusId;
    if (wantedToChangeStatus) {
      const newStatusChangedAt = new Date();
      if (transport.lastOperatorFullname) {
        const operatorShift = await this.userService.findOrStartOperatorShift(
          transport.lastOperatorFullname,
          id,
        );
        if (transport.lastOperatorFullname) {
          if (newStatus.isBusy && !transport.status.isBusy) {
            await operatorShift.increment({
              summaryNotBusyTime:
                (newStatusChangedAt as any) - (oldStatusChangedAt as any),
            });
          } else if (!newStatus.isBusy && transport.status.isBusy) {
            await operatorShift.increment({
              summaryBusyTime:
                (newStatusChangedAt as any) - (oldStatusChangedAt as any),
            });
          }
        }
      }

      if (newStatus.code === 'FREE' && transport.transportTypeId) {
        AppGateway.instance.freeTransportType(transport);
      }

      await transport.update({
        statusId: newStatus.id,
        statusChangedAt: newStatusChangedAt,
      });
      AppGateway.instance.transportUpdate(transport);
    }
    return transport;
  }

  async findOne(id: number) {
    const transport = await this.transportRepository.findOne({
      where: { id, isDeleted: false },
      include: [User, Status],
    });
    if (!transport) throw new NotFoundException('Transport not founded!');
    return transport;
  }

  async findOneByDriverId(id: number) {
    const transport = await this.transportRepository.findOne({
      where: { driverId: id, isDeleted: false },
      include: [User, Status],
    });
    if (!transport) throw new NotFoundException('Transport not founded!');
    return transport;
  }

  async create(createTransportDto: CreateTransportDto) {
    const deletedTransport = await this.transportRepository.findOne({
      include: [User],
      where: {
        isDeleted: true,
        transportNumber: createTransportDto.transportNumber,
      },
    });
    if (deletedTransport)
      await deletedTransport.update({
        isDeleted: false,
        type: createTransportDto.type,
        transportTypeId: createTransportDto.transportTypeId,
        latitude: createTransportDto.latitude,
        longitude: createTransportDto.longitude,
        statusId: createTransportDto.statusId,
        placeId: createTransportDto.placeId,
        driverId: createTransportDto.driverId,
        isLocal: createTransportDto.isLocal,
        width: createTransportDto.width,
        weight: createTransportDto.weight,
        length: createTransportDto.length,
        height: createTransportDto.height,
        statusChangedAt: new Date(),
        agGUID: createTransportDto.agGUID,
      });
    const transport = deletedTransport
      ? deletedTransport
      : await this.transportRepository.create(
          {
            type: createTransportDto.type,
            transportTypeId: createTransportDto.transportTypeId,
            transportNumber: createTransportDto.transportNumber,
            latitude: createTransportDto.latitude,
            longitude: createTransportDto.longitude,
            statusId: createTransportDto.statusId,
            placeId: createTransportDto.placeId,
            driverId: createTransportDto.driverId,
            isLocal: createTransportDto.isLocal,
            width: createTransportDto.width,
            weight: createTransportDto.weight,
            length: createTransportDto.length,
            height: createTransportDto.height,
            statusChangedAt: new Date(),
            agGUID: createTransportDto.agGUID,
          },
          {
            include: [User],
          },
        );
    AppGateway.instance.transportCreate(transport);
    AppGateway.instance.transportFree(transport);
    return transport;
  }

  async update(id: number, updateTransportDto: UpdateTransportDto) {
    const transport = await this.findOne(id);
    const driverId = transport.driverId
    await transport.update({
      type: updateTransportDto.type,
      transportTypeId: updateTransportDto.transportTypeId,
      transportNumber: updateTransportDto.transportNumber,
      latitude: updateTransportDto.latitude,
      longitude: updateTransportDto.longitude,
      statusId: updateTransportDto.statusId,
      placeId: updateTransportDto.placeId,
      driverId: updateTransportDto.driverId,
      isLocal: updateTransportDto.isLocal,
      width: updateTransportDto.width,
      weight: updateTransportDto.weight,
      length: updateTransportDto.length,
      height: updateTransportDto.height,
      agGUID: updateTransportDto.agGUID,
    });
    AppGateway.instance.transportUpdate(transport);
    if (transport.driverId == null) {
      if (driverId)
      await this.userService.endDriverShift(driverId)
      AppGateway.instance.transportFree(transport);
    }
    return transport;
  }

  async delete(id: number) {
    const transport = await this.findOne(id);
    const order = await this.orderRepository.findOne({
      where: { transportId: id, isDone: false },
    });
    if (!order) {
      await transport.update({ isDeleted: true, driverId: null });
      AppGateway.instance.transportDelete(transport);
    } else {
      throw new BadRequestException('Машина с заказом!');
    }
  }
}
