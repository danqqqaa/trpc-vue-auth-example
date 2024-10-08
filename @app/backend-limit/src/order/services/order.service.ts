import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../models/order.model';
import { CustomerService } from 'src/customer/customer.service';
import { ContactService } from 'src/contact/contact.service';
import { UserService } from 'src/user/user.service';
import { TransportService } from 'src/transport/transport.service';
import { statuses, StatusService } from 'src/status/status.service';
import { Transport } from 'src/transport/transport.model';
import { AppGateway } from 'src/app.gateway';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ROLE, User } from 'src/user/user.model';
import { Customer } from 'src/customer/customer.model';
import { PlaceService } from 'src/place/place.service';
import { OrderStats } from '../models/order-stats.model';
import { Sequelize } from 'sequelize-typescript';
import sequelize from 'sequelize';
import { ManagementService } from 'src/management/management.service';
import { OrderBatchDto, OrderBatchElementDto } from '../dto/order-batch.dto';
import { Route } from '../models/route.model';
import { NotificationService } from 'src/notification/notification.service';
import { OrderTransactionService } from './order-transaction.service';
import { OrderStatusService } from './order-status.service';
import { CargoType } from 'src/recommendation/models/cargo-type.model';
import { TransportType } from 'src/recommendation/models/transport-type.model';

export interface IBatchElement {
  isApproved: boolean;
  isDeclined: boolean;
  isRequest: boolean;
  routeId: number;
  orderBatchElementDto: OrderBatchElementDto;
  customer: Customer;
  departurePointId: number;
  transport: Transport;
  operator: User;
  description: string;
  isEmergency: boolean;
  orderTime: Date;
  priority: number;
  isParent: boolean;
  activeOrder: Order;
  parentOrder?: number;
  isCustomer?: boolean;
  userPayload?: { id: number; role?: ROLE };
}

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order, 'GAZELLE_REPOSITORY')
    private readonly orderRepository: typeof Order,
    @InjectModel(OrderStats, 'GAZELLE_REPOSITORY')
    private readonly orderStatsRepository: typeof OrderStats,
    @InjectModel(Route, 'GAZELLE_REPOSITORY')
    private readonly routeRepository: typeof Route,
    @InjectModel(CargoType, 'GAZELLE_REPOSITORY')
    private readonly cargoTypeRepository: typeof CargoType,
    @InjectModel(TransportType, 'GAZELLE_REPOSITORY')
    private readonly transportTypeRepository: typeof TransportType,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
    private readonly contactService: ContactService,
    private readonly transportService: TransportService,
    private readonly placeService: PlaceService,
    private readonly statusService: StatusService,
    private readonly userService: UserService,
    private readonly managementService: ManagementService,
    private readonly orderTransactionService: OrderTransactionService,
    private readonly orderStatusService: OrderStatusService,
  ) { }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const status = await this.statusService.findByCode(statuses.WAIT.code);

    const transports = await this.transportService.findTransportWithStatus(
      status.id,
    );

    transports.map(async (t) => {
      if (t.driver && t.driver.isOnDriverShift == true && t.driver.fcmToken) {
        try {
          const route = await this.transportService.findDriverRoute(t.driverId);
          const order = route?.findActiveOrder();
          NotificationService.sendDriverNotification(t.driver, order);
        } catch (error) { }
      }
    });
  }

  //отчет
  async mvz(dates: { from: string; to: string, transport: string }) {
    return this.orderStatsRepository.getStatsMvz(dates);
  }

  async findOrderStatsSubdivision(dates: { from: string; to: string }) {
    return await this.orderStatsRepository.getStatsSubdivision(dates);
  }

  async findStatsContorlLimits(date: {
    period: number;
    month: number;
    year: number;
    mvz?: boolean
  }) {
    return this.orderStatsRepository.getStatsControlLimits(date);
  }

  async findOrdersIndicatorStats(date: { month: number; year: number }) {
    return this.orderStatsRepository.getIndicatorStats(date);
  }

  async findHoursStatsControlLimits(date: { month: number; year: number }) {
    return this.orderStatsRepository.getHoursStatsControlLimits(date);
  }

  async getOrderNames() {
    return this.orderRepository.findAll({
      attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('name')), 'name']],
    });
  }

  async getStatsDates() {
    return this.orderRepository.findOne({
      attributes: [
        [sequelize.fn('min', sequelize.col('orderTime')), 'min'],
        [sequelize.fn('max', sequelize.col('orderTime')), 'max'],
      ],
      where: {
        isDone: true,
      },
    });
  }

  async getStats(dates: { from: string; to: string }) {
    return this.orderStatsRepository.getStats(dates);
  }

  findAllRoutes() {
    return this.routeRepository.findOperatorListRoutes();
  }

  async findAllCurrentCustomerNew(customerId: number, query) {
    return await this.routeRepository.findCustomerHistoryOfRoutes(
      customerId,
      query,
    );
  }

  async getMyHierarchyOrdersStats(userId: number, onlyCurrent: number) {
    return await this.routeRepository.myHierarchyOrdersStats(
      userId,
      onlyCurrent === 1,
    );
  }

  async getMyHierarchyOrders(userId: number, year: number, month: number) {
    const customer = await this.customerService.findOne(userId);
    const customerIds = await this.managementService.getMyHierarchyUsers(
      userId,
      customer.managementId,
    );
    if (customerIds.length == 0) return [];
    return await this.orderStatsRepository.myHierarchyOrders(customerIds, year, month);
  }

  async getManagementHierarchyOrders(managementId: number, year: number, month: number) {
    const customerIds = await this.customerService.getManagementUsers(
      managementId,
    );
    if (customerIds.length == 0) return [];
    return await this.orderStatsRepository.myHierarchyOrders(customerIds, year, month);
  }

  async findCurrentOrder(routeId: number, currentOrderId: number) {
    return await this.orderRepository.findCurrentOrder(routeId, currentOrderId);
  }

  async findOrderStats(id: number) {
    return this.orderStatsRepository.getStatsForOrder(id);
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not founded!');
    return order;
  }

  async deleteBatch(id: number, orderBatchDto: OrderBatchDto, userId: number) {
    const route = await this.routeRepository.findOne({
      where: { id },
      include: { model: Order },
    });
    await route.update({
      isDone: true,
      isDeleted: true,
      comment: orderBatchDto.comment,
    });
    const transportId = route.transportId;
    const transport = await this.transportService.findOne(transportId);
    const [_, deletedOrders] = await this.orderRepository.update(
      { isDeleted: true, isDone: true },
      { where: { routeId: route.id, isDone: false }, returning: true },
    );
    AppGateway.instance.routeDelete(route, deletedOrders[0]?.customerId);
    deletedOrders.forEach(async (o) => {
      await AppGateway.instance.orderFinish(o);
      const operator = await this.userService.findOne(userId);
      const stats = await this.orderStatsRepository.findOne({
        where: {
          orderId: o.id,
        },
      });
      await stats.update({
        isDeleted: true,
        doneAt: new Date(),
        deletedByFullname: `${operator.surname} ${operator.name} ${operator.middlename} (Диспетчер)`,
      });
      await this.orderTransactionService.createTransactionAG(o.id);
    });
    if (transportId) await this.resetTransportRoute(transportId);
  }

  async backToRequest(
    id: number,
    orderBatchDto: OrderBatchDto,
    userPayload: { id: number; role?: ROLE },
  ) {
    const route = await this.routeRepository.findOne({
      where: { id },
      include: { model: Order },
    });

    await route.update({
      isDone: false,
      isApproved: false,
      isDeclined: false,
    });
    await this.transportService.setStatus(
      route.transportId,
      statuses.FREE.code,
    );
    const routeNotResolvedRequest =
      route.isRequest && !route.isDeclined && !route.isApproved;

    const routeStatusChangedToApproved =
      routeNotResolvedRequest && orderBatchDto.isApproved;

    const isCustomer = userPayload.role == undefined;
    if (orderBatchDto.isDeclined != null && orderBatchDto.isDeclined == true) {
      return await this.declineRoute(route, isCustomer, userPayload.id);
    } else if (routeStatusChangedToApproved) {
      await route.update({
        isApproved: true,
      });
    }

    const customer =
      await this.customerService.findOneOrCreateByPhoneNumberAndFullnameAndSubdivision(
        orderBatchDto.customerPhoneNumber,
        orderBatchDto.customerFullname,
        orderBatchDto.customerSubdivision,
        orderBatchDto.customermvz,
      );

    const departurePoint = await this.placeService.findOneOrCreateByName(
      orderBatchDto.departurePointName,
    );

    const transportChanged = orderBatchDto.transportId != route.transportId;

    if (transportChanged) {
      const oldTransportId = route.transportId;
      await route.update({ transportId: orderBatchDto.transportId });
      await this.resetStatus(oldTransportId);
      await this.resetTransportRoute(oldTransportId);
      await this.resetStatus(orderBatchDto.transportId);
    }

    const transport = !!orderBatchDto.transportId
      ? await this.transportService.findOne(orderBatchDto.transportId)
      : null;

    const operator = await this.userService.findAdminOrOperator(userPayload.id);

    const flagActiveOrder = !!transport;

    var activeOrder = flagActiveOrder
      ? (await this.findDriverRoute(transport.driverId))?.findActiveOrder()
      : null;
    const { order: firstOrder, contact: firstContact } =
      await this.createOrUpdateBatch({
        isApproved: orderBatchDto.isApproved,
        isDeclined: orderBatchDto.isDeclined,
        isRequest: orderBatchDto.isRequest,
        routeId: route.id,
        orderBatchElementDto: orderBatchDto.elements[0],
        customer,
        departurePointId: departurePoint.id,
        transport: null,
        operator,
        description: orderBatchDto.description,
        isEmergency: orderBatchDto.isEmergency,
        orderTime: orderBatchDto.orderTime,
        priority: 0,
        isParent: true,
        activeOrder,
        isCustomer,
        userPayload,
      });
    var currentOrder = firstOrder;

    for (let i = 1; i < orderBatchDto.elements.length; i++) {
      activeOrder = flagActiveOrder
        ? (await this.findDriverRoute(transport.driverId))?.findActiveOrder()
        : null;
      const _co = (
        await this.createOrUpdateBatch({
          isApproved: orderBatchDto.isApproved,
          isDeclined: orderBatchDto.isDeclined,
          isRequest: orderBatchDto.isRequest,
          routeId: route.id,
          orderBatchElementDto: orderBatchDto.elements[i],
          customer,
          departurePointId: currentOrder.destinationId,
          transport: null,
          operator,
          description: orderBatchDto.description,
          isEmergency: orderBatchDto.isEmergency,
          orderTime: null,
          priority: i,
          isParent: i == 1 && !firstOrder,
          activeOrder,
          parentOrder: firstOrder?.id,
          isCustomer,
          userPayload,
        })
      )?.order;
      if (_co) currentOrder = _co;
    }
    await this.resetTransportRoute(route.transportId);
    AppGateway.instance.routeUpdate(
      await this.routeRepository.findOne({
        where: { id },
        include: { model: Order },
      }), customer?.id,)
  }

  async completeBatch(
    id: number,
    orderBatchDto: OrderBatchDto,
    userId: number,
  ) {
    const route = await this.routeRepository.findOne({
      where: { id },
      include: { model: Order },
    });
    await route.update({ isDone: true });
    if (route.transportId) await this.resetTransportRoute(route.transportId);

    const [_, deletedOrders] = await this.orderRepository.update(
      { isDone: false },
      { where: { routeId: route.id, isDone: false }, returning: true },
    );
    AppGateway.instance.routeDelete(route, deletedOrders[0]?.customerId);
    deletedOrders.forEach(async (o) => {
      await AppGateway.instance.orderFinish(o);
    });
  }

  private async declineRoute(
    route: Route,
    isCustomer: boolean,
    userId: number,
  ) {
    const oldTransportId = route.transportId;
    if (oldTransportId) {
      var transport = await this.transportService.findOne(oldTransportId);
    }
    await route.update({
      isDeclined: true,
      isDone: true,
    });
    const [_, declinedOrders] = await this.orderRepository.update(
      { isDeclined: true, isDone: true, isDeleted: isCustomer },
      { where: { routeId: route.id, isDone: false }, returning: true },
    );
    await this.resetStatus(oldTransportId);
    await this.resetTransportRoute(oldTransportId);
    AppGateway.instance.routeDelete(route, declinedOrders[0]?.customerId);
    declinedOrders.forEach(async (o) => {
      await AppGateway.instance.orderUpdate(o);
      const stats = await this.orderStatsRepository.findOne({
        where: {
          orderId: o.id,
        },
      });
      if (isCustomer) {
        const customer = await this.customerService.findOne(userId);
        await stats.update({
          isDeleted: true,
          doneAt: new Date(),
          deletedByFullname: `${customer.fullname} (${customer.subdivision})`,
        });
      } else {
        const operator = await this.userService.findOne(userId);
        await stats.update({
          isDeleted: true,
          deletedByFullname: `${operator.surname} ${operator.name} ${operator.middlename} (Диспетчер)`,
          doneAt: new Date(),
        });
      }
      if (transport) {
        await this.orderTransactionService.createTransactionAG(o.id);
      }
    });
  }

  private async resetStatus(transportId: number) {
    if (!transportId) return;
    try {
      const transport = await this.transportService.findOne(transportId);
      if (transport && transport.driverId) {
        const newRouteOfOldTransport = await this.findDriverRoute(
          transport.driverId,
        );
        if (newRouteOfOldTransport)
          await this.transportService.setStatus(
            transportId,
            newRouteOfOldTransport.findActiveOrder().status.code,
          );
        else
          await this.transportService.setStatus(
            transportId,
            statuses.FREE.code,
          );
      } else {
        await this.transportService.setStatus(transportId, statuses.FREE.code);
      }
    } catch (error) { }
  }

  private async resetTransportRoute(transportId: number) {
    if (!transportId) return;
    var transport;
    try {
      transport = await this.transportService.findOne(transportId);
    } catch (error) {
      return;
    }
    if (transport && transport.driverId) {
      const activeRoute = await this.findDriverRoute(transport.driverId, true);
      if (activeRoute) {
        const activeOrder = activeRoute.findActiveOrder();
        const activeRouteOrders = await this.orderRepository.findAll({
          order: [['priority', 'asc']],
          where: {
            routeId: activeRoute.id,
            [sequelize.Op.or]: [{ isRequest: false }, { isApproved: true }],
            isDeleted: false,
            isDone: false,
          },
        });
        for (let i = 0; i < activeRouteOrders.length; i++) {
          const status = i == 0 ? statuses.WAIT.code : statuses.ORDERED.code;
          await activeRouteOrders[i].update({
            statusId: (await this.statusService.findByCode(status)).id,
          });
        }
        AppGateway.instance.routeUpdate(
          await this.routeRepository.findOne({
            where: { id: activeRoute.id },
            include: { model: Order, where: { isDeleted: false } },
          }),
          activeOrder.customerId,
        );
      }
    }
  }

  //обновление
  async updateBatch(
    id: number,
    orderBatchDto: OrderBatchDto,
    userPayload: { id: number; role?: ROLE },
  ) {
    const route = await this.routeRepository.findOne({
      where: { id },
      include: { model: Order },
    });
    await route.update({
      orderTime: orderBatchDto.orderTime,
      comment: orderBatchDto.comment,
    });

    const routeNotResolvedRequest =
      route.isRequest && !route.isDeclined && !route.isApproved;

    const routeStatusChangedToApproved =
      routeNotResolvedRequest && orderBatchDto.isApproved;

    const isBackToRequest =
      route.isRequest &&
      route.isApproved &&
      orderBatchDto.isApproved === false &&
      orderBatchDto.isDeclined === false &&
      orderBatchDto.isRequest === true;

    const routeStatusChangedToDeclined =
      routeNotResolvedRequest && orderBatchDto.isDeclined;

    if (isBackToRequest) {
      await route.update({
        isApproved: false,
        isDeclined: false,
      });
      await this.transportService.setStatus(
        route.transportId,
        statuses.FREE.code,
      );
    }
    const isCustomer = userPayload.role == undefined;
    if (orderBatchDto.isDeclined != null && orderBatchDto.isDeclined == true) {
      return await this.declineRoute(route, isCustomer, userPayload.id);
    } else if (routeStatusChangedToApproved) {
      await route.update({
        isApproved: true,
      });
    }

    const customer =
      await this.customerService.findOneOrCreateByPhoneNumberAndFullnameAndSubdivision(
        orderBatchDto.customerPhoneNumber,
        orderBatchDto.customerFullname,
        orderBatchDto.customerSubdivision,
        orderBatchDto.customermvz,
      );

    const departurePoint = await this.placeService.findOneOrCreateByName(
      orderBatchDto.departurePointName,
    );

    const transportChanged = orderBatchDto.transportId != route.transportId;

    if (transportChanged) {
      const oldTransportId = route.transportId;
      await route.update({ transportId: orderBatchDto.transportId });
      await this.resetStatus(oldTransportId);
      await this.resetTransportRoute(oldTransportId);
      await this.resetStatus(orderBatchDto.transportId);
    }

    const transport = !!orderBatchDto.transportId
      ? await this.transportService.findOne(orderBatchDto.transportId)
      : null;

    const operator = await this.userService.findAdminOrOperator(userPayload.id);

    const flagActiveOrder = !!transport;

    var activeOrder = flagActiveOrder
      ? (await this.findDriverRoute(transport.driverId))?.findActiveOrder()
      : null;
    const { order: firstOrder, contact: firstContact } =
      await this.createOrUpdateBatch({
        isApproved: orderBatchDto.isApproved,
        isDeclined: orderBatchDto.isDeclined,
        isRequest: orderBatchDto.isRequest,
        routeId: route.id,
        orderBatchElementDto: orderBatchDto.elements[0],
        customer,
        departurePointId: departurePoint.id,
        transport: isBackToRequest ? null : transport,
        operator,
        description: orderBatchDto.description,
        isEmergency: orderBatchDto.isEmergency,
        orderTime: orderBatchDto.orderTime,
        priority: 0,
        isParent: true,
        activeOrder,
        isCustomer,
        userPayload,
      });
    var currentOrder = firstOrder;

    for (let i = 1; i < orderBatchDto.elements.length; i++) {
      activeOrder = flagActiveOrder
        ? (await this.findDriverRoute(transport.driverId))?.findActiveOrder()
        : null;
      const _co = (
        await this.createOrUpdateBatch({
          isApproved: orderBatchDto.isApproved,
          isDeclined: orderBatchDto.isDeclined,
          isRequest: orderBatchDto.isRequest,
          routeId: route.id,
          orderBatchElementDto: orderBatchDto.elements[i],
          customer,
          departurePointId: currentOrder.destinationId,
          transport: isBackToRequest ? null : transport,
          operator,
          description: orderBatchDto.description,
          isEmergency: orderBatchDto.isEmergency,
          orderTime: null,
          priority: i,
          isParent: i == 1 && !firstOrder,
          activeOrder,
          parentOrder: firstOrder?.id,
          isCustomer,
          userPayload,
        })
      )?.order;
      if (_co) currentOrder = _co;
    }
    const activeOrders = await this.orderRepository.findAll({
      where: { routeId: route.id, isDone: false },
    });
    if (activeOrders.length == 0) {
      await route.update({ isDone: true });
      await this.resetTransportRoute(route.transportId);
      AppGateway.instance.routeDelete(route, firstOrder?.customerId);
    } else {
      AppGateway.instance.routeUpdate(
        await this.routeRepository.findOne({
          where: { id: route.id },
          include: { model: Order, where: { isDeleted: false } },
        }),
        customer?.id,
      );
      if (
        transport &&
        (!route.isRequest || (route.isRequest && route.isApproved))
      )
        await AppGateway.instance.driverOrderCreated(transport.driverId);
      if (customer && customer.fcmToken) {
        await NotificationService.sendFirebaseMessage(
          customer,
          `Заказ #${firstOrder.id} обновлен!`,
          'Заказ обновлен!',
        );
        if (firstContact) {
          const customerWithContactPhone =
            await this.customerService.findOneByphone(firstContact.phoneNumber);
          if (customerWithContactPhone) {
            await NotificationService.sendFirebaseMessage(
              customerWithContactPhone,
              `Заказ #${firstOrder.id} обновлен!`,
              'Заказ обновлен!',
            );
          }
        }
      }
      if (customer && orderBatchDto.transportId && !isBackToRequest) {
        await this.transportService.setLastCustomer(
          firstOrder.transportId,
          customer,
        );
      }
    }
  }

  async createBatch(orderBatchDto: OrderBatchDto, userId: number) {
    const customer =
      await this.customerService.findOneOrCreateByPhoneNumberAndFullnameAndSubdivision(
        orderBatchDto.customerPhoneNumber,
        orderBatchDto.customerFullname,
        orderBatchDto.customerSubdivision,
        orderBatchDto.customermvz,
      );

    const departurePoint = await this.placeService.findOneOrCreateByName(
      orderBatchDto.departurePointName,
    );

    const operator = await this.userService.findAdminOrOperator(userId);

    const transport = !!orderBatchDto.transportId
      ? await this.transportService.findOne(orderBatchDto.transportId)
      : null;

    if (!!transport && !!operator && !!operator.role) {
      await transport.update({
        lastOperatorFullname: `${operator.surname} ${operator.name} ${operator.middlename}`,
      });
    }

    const route = await this.routeRepository.create({
      isEmergency: orderBatchDto.isEmergency,
      transportId: transport?.id,
      orderTime: orderBatchDto.orderTime,
      isRequest: !!orderBatchDto.isRequest,
    });

    var activeOrder = !!transport
      ? (await this.findDriverRoute(transport.driverId))?.findActiveOrder()
      : null;

    const { order: firstOrder, contact: firstContact } =
      await this.createBatchElement({
        isApproved: orderBatchDto.isApproved,
        isDeclined: orderBatchDto.isDeclined,
        isRequest: orderBatchDto.isRequest,
        routeId: route.id,
        orderBatchElementDto: orderBatchDto.elements[0],
        customer,
        departurePointId: departurePoint.id,
        transport,
        operator,
        description: orderBatchDto.description,
        isEmergency: orderBatchDto.isEmergency,
        orderTime: orderBatchDto.orderTime,
        priority: 0,
        isParent: true,
        activeOrder,
      });

    var currentOrder = firstOrder;

    for (let i = 1; i < orderBatchDto.elements.length; i++) {
      activeOrder = !!transport
        ? (await this.findDriverRoute(transport.driverId))?.findActiveOrder()
        : null;
      currentOrder = (
        await this.createBatchElement({
          isApproved: orderBatchDto.isApproved,
          isDeclined: orderBatchDto.isDeclined,
          isRequest: orderBatchDto.isRequest,
          routeId: route.id,
          orderBatchElementDto: orderBatchDto.elements[i],
          customer,
          departurePointId: currentOrder.destinationId,
          transport,
          operator,
          description: orderBatchDto.description,
          isEmergency: orderBatchDto.isEmergency,
          orderTime: null,
          priority: i,
          isParent: false,
          parentOrder: firstOrder.id,
          activeOrder,
        })
      )?.order;
    }

    if (!!transport) {
      this.resetStatus(transport.id);
    }

    AppGateway.instance.routeCreate(
      await this.routeRepository.findOne({
        where: { id: route.id },
        include: { model: Order, where: { isDeleted: false } },
      }),
    );

    const routeNotRequestOrApproved =
      !route.isRequest || (route.isRequest && route.isApproved);

    if (!!transport && routeNotRequestOrApproved)
      await AppGateway.instance.driverOrderCreated(transport.driverId);

    if (customer && customer.fcmToken) {
      await NotificationService.sendFirebaseMessage(
        customer,
        `На вас создали заказ #${firstOrder.id}!`,
        'Заказ создан!',
      );
      if (firstContact) {
        const customerWithContactPhone =
          await this.customerService.findOneByphone(firstContact.phoneNumber);
        if (customerWithContactPhone) {
          await NotificationService.sendFirebaseMessage(
            customerWithContactPhone,
            `На вас создали заказ #${firstOrder.id}!`,
            'Заказ создан!',
          );
        }
      }
    }

    if (customer && orderBatchDto.transportId) {
      await this.transportService.setLastCustomer(
        firstOrder.transportId,
        customer,
      );
    }
  }

  async createOrUpdateBatch({
    isApproved,
    isDeclined,
    isRequest,
    routeId,
    orderBatchElementDto,
    customer,
    departurePointId,
    transport,
    operator,
    description,
    isEmergency,
    orderTime,
    priority,
    isParent,
    activeOrder,
    parentOrder,
    isCustomer,
    userPayload,
  }: IBatchElement) {
    if (orderBatchElementDto.isNew) {
      return await this.createBatchElement({
        isApproved,
        isDeclined,
        isRequest,
        routeId,
        orderBatchElementDto,
        customer,
        departurePointId,
        transport,
        operator,
        description,
        isEmergency,
        orderTime,
        priority,
        isParent,
        activeOrder,
        parentOrder,
      });
    }
    if (
      orderBatchElementDto.forDelete != null &&
      orderBatchElementDto.forDelete == true
    ) {
      await this.deleteBatchElement(
        orderBatchElementDto.existingId,
        isCustomer,
        userPayload,
      );
      return;
    }
    const contact = await this.findContact(orderBatchElementDto);

    const cargoReciever = await this.findCargoReciever(
      orderBatchElementDto,
      customer,
    );

    const destination = await this.placeService.findOneOrCreateByName(
      orderBatchElementDto.destinationName,
    );
    const order = await this.orderRepository.findOne({
      where: { id: orderBatchElementDto.existingId },
    });
    const orderStats = await this.orderStatsRepository.findOne({
      where: { orderId: orderBatchElementDto.existingId },
    });

    const transportId = transport ? transport.id : null;

    if (order.isDone) {
      await order.update({
        priority,
        isDeclined,
        isApproved,
        parentOrder,
      });
    } else {
      const statusCode = this.orderStatusService.calculateStatus({
        order,
        isDeclined,
        isRequest,
        isApproved,
        activeOrder,
      });
      const statusId = !!statusCode
        ? (await this.statusService.findByCode(statusCode)).id
        : undefined;

      const cargoType =
        !!orderBatchElementDto.cargoTypeId &&
          orderBatchElementDto.cargoTypeId !== -1
          ? await this.cargoTypeRepository.findOne({
            where: { id: orderBatchElementDto.cargoTypeId },
          })
          : null;

      if (!cargoType && orderBatchElementDto.withCargoTypeRequest) {
        await this.cargoTypeRepository.create({
          priority: 1,
          description: orderBatchElementDto.name,
          isRequest: true,
          withEmergency: false,
        });
      }

      await order.update({
        ...orderBatchElementDto,
        cargoTypeId:
          orderBatchElementDto.cargoTypeId === -1
            ? null
            : orderBatchElementDto.cargoTypeId,
        name: cargoType ? cargoType.description : orderBatchElementDto.name,
        contactId: contact?.id ?? null,
        customerId: customer.id,
        destinationId: destination.id,
        departurePointId,
        priority,
        parentOrder: parentOrder,
        routeId,
        description,
        isEmergency,
        orderTime,
        statusId: statusId,
        statusChangedAt:
          !!statusId && statusId != order.statusId ? new Date() : undefined,
        transportId,
        isDone: !!isDeclined,
        isDeclined: !!isDeclined,
        isApproved: !!isApproved,
        cargoRecieverId: cargoReciever?.id ?? null,
      });
      if (isParent) {
        await order.update({ parentOrder: order.id });
      }
      const transportType =
        transport && transport.transportTypeId
          ? await this.transportTypeRepository.findOne({
            where: { id: transport.transportTypeId },
          })
          : null;

      await orderStats?.update({
        placeId: transport?.placeId,
        orderId: order.id,
        transportNumber: transport ? transport.transportNumber : '',
        transportType:
          transport && transportType
            ? transportType.description
            : transport && transport.type
              ? transport.type
              : '',
        driverFullname: transport
          ? `${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename}`
          : '',
        driverPhoneNumber: transport ? transport.driver.workingPhoneNumber : '',
        timeBetweenOrders: transport
          ? (new Date() as any) - (transport.statusChangedAt as any)
          : 0,
        operatorFullname:
          operator && operator.surname
            ? `${operator.surname} ${operator.name} ${operator.middlename}`
            : '',
      });
    }

    await AppGateway.instance.orderUpdate(order);
    return { order, contact };
  }

  private async deleteBatchElement(
    id: number,
    isCustomer: boolean,
    userPayload: { id: number; role?: ROLE },
  ) {
    const result = await this.orderRepository.update(
      { isDeleted: true, isDone: true },
      { where: { id } },
    );
    const stats = await this.orderStatsRepository.findOne({
      where: {
        orderId: id,
      },
    });
    if (isCustomer) {
      const customer = await this.customerService.findOne(userPayload.id);
      await stats.update({
        isDeleted: true,
        doneAt: new Date(),
        deletedByFullname: `${customer.fullname} (${customer.subdivision})`,
      });
    } else {
      const operator = await this.userService.findOne(userPayload.id);
      await stats.update({
        isDeleted: true,
        deletedByFullname: `${operator.surname} ${operator.name} ${operator.middlename} (Диспетчер)`,
        doneAt: new Date(),
      });
    }
    return result;
  }

  private async createBatchElement({
    isApproved,
    isDeclined,
    isRequest,
    routeId,
    orderBatchElementDto,
    customer,
    departurePointId,
    transport,
    operator,
    description,
    isEmergency,
    orderTime,
    priority,
    isParent,
    activeOrder,
    parentOrder,
  }: IBatchElement) {
    const contact = await this.findContact(orderBatchElementDto);

    const cargoReciever = await this.findCargoReciever(
      orderBatchElementDto,
      customer,
    );

    const destination = await this.placeService.findOneOrCreateByName(
      orderBatchElementDto.destinationName,
    );
    const status = this.orderStatusService.calculateStatus({
      order: null,
      isRequest,
      isDeclined,
      isApproved,
      activeOrder,
    });

    const cargoType =
      !!orderBatchElementDto.cargoTypeId &&
        orderBatchElementDto.cargoTypeId !== -1
        ? await this.cargoTypeRepository.findOne({
          where: { id: orderBatchElementDto.cargoTypeId },
        })
        : null;

    if (!cargoType && orderBatchElementDto.withCargoTypeRequest) {
      await this.cargoTypeRepository.create({
        priority: 1,
        description: orderBatchElementDto.name,
        isRequest: true,
        withEmergency: false,
      });
    }

    const order = await this.orderRepository.create({
      ...orderBatchElementDto,
      cargoTypeId:
        orderBatchElementDto.cargoTypeId === -1
          ? null
          : orderBatchElementDto.cargoTypeId,
      name: cargoType ? cargoType.description : orderBatchElementDto.name,
      contactId: contact?.id ?? null,
      customerId: customer.id,
      destinationId: destination.id,
      departurePointId,
      statusId: !!status
        ? (
          await this.statusService.findByCode(status)
        ).id
        : undefined,
      statusChangedAt: new Date(),
      priority,
      parentOrder: parentOrder,
      routeId,
      description,
      isEmergency,
      orderTime: new Date() > orderTime ? new Date() : orderTime,
      transportId: transport?.id ?? null,
      isRequest: !!isRequest,
      isDeclined: !!isDeclined,
      isApproved: !!isApproved,
      cargoRecieverId: cargoReciever?.id ?? null,
    });
    if (isParent) {
      await order.update({ parentOrder: order.id });
    }

    const transportType =
      transport && transport.transportTypeId
        ? await this.transportTypeRepository.findOne({
          where: { id: transport.transportTypeId },
        })
        : null;

    await this.orderStatsRepository.create({
      placeId: transport?.placeId,
      orderId: order.id,
      transportNumber: transport ? transport.transportNumber : '',
      transportType:
        transport && transportType
          ? transportType.description
          : transport && transport.type
            ? transport.type
            : '',
      driverFullname: transport
        ? `${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename}`
        : '',
      driverPhoneNumber: transport ? transport.driver.workingPhoneNumber : '',
      timeBetweenOrders: transport
        ? (new Date() as any) - (transport.statusChangedAt as any)
        : 0,
      operatorFullname:
        operator && operator.surname
          ? `${operator.surname} ${operator.name} ${operator.middlename}`
          : '',
    });
    await AppGateway.instance.orderCreate(order);
    return { order, contact };
  }

  private async findContact(orderBatchElementDto: OrderBatchElementDto) {
    return orderBatchElementDto.contactPhoneNumber &&
      orderBatchElementDto.contactFullname
      ? await this.contactService.findOneOrCreateByPhoneNumberAndFullname(
        orderBatchElementDto.contactPhoneNumber,
        orderBatchElementDto.contactFullname,
      )
      : null;
  }

  private async findCargoReciever(
    orderBatchElementDto: OrderBatchElementDto,
    customer: Customer,
  ) {
    return orderBatchElementDto.cargoRecieverPhoneNumber &&
      orderBatchElementDto.cargoRecieverFullname &&
      orderBatchElementDto.cargoRecieverSubdivision &&
      orderBatchElementDto.cargoRecieverPhoneNumber != customer.phoneNumber &&
      orderBatchElementDto.cargoRecieverFullname != customer.fullname &&
      orderBatchElementDto.cargoRecieverSubdivision != customer.subdivision
      ? await this.customerService.findOneOrCreateByPhoneNumberAndFullnameAndSubdivision(
        orderBatchElementDto.cargoRecieverPhoneNumber,
        orderBatchElementDto.cargoRecieverFullname,
        orderBatchElementDto.cargoRecieverSubdivision,
        orderBatchElementDto.cargoRecievermvz,
      )
      : await this.customerService.findOneByPhoneNumberAndFullnameAndSubdivision(
        orderBatchElementDto.cargoRecieverPhoneNumber,
        orderBatchElementDto.cargoRecieverFullname,
        orderBatchElementDto.cargoRecieverSubdivision
      );
  }

  findDriverRoute(id: number, ignoreStatuses: boolean = false) {
    return this.transportService.findDriverRoute(id, ignoreStatuses);
  }
}
