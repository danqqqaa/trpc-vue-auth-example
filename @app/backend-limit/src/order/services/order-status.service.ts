import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize from 'sequelize';
import { AppGateway } from 'src/app.gateway';
import { ContactService } from 'src/contact/contact.service';
import { Customer } from 'src/customer/customer.model';
import { CustomerService } from 'src/customer/customer.service';
import { ManagementService } from 'src/management/management.service';
import { NotificationService } from 'src/notification/notification.service';
import { StatusScenario } from 'src/status/status-scenario.model';
import { Status } from 'src/status/status.model';
import { statuses, StatusService } from 'src/status/status.service';
import { Transport } from 'src/transport/transport.model';
import { TransportService } from 'src/transport/transport.service';
import { UserService } from 'src/user/user.service';
import { OrderStats } from '../models/order-stats.model';
import { Order } from '../models/order.model';
import { Route } from '../models/route.model';
import { OrderTransactionService } from './order-transaction.service';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectModel(Order, 'GAZELLE_REPOSITORY')
    private readonly orderRepository: typeof Order,
    @InjectModel(Status, 'GAZELLE_REPOSITORY')
    private readonly statusRepository: typeof Status,
    @InjectModel(OrderStats, 'GAZELLE_REPOSITORY')
    private readonly orderStatsRepository: typeof OrderStats,
    @InjectModel(Transport, 'GAZELLE_REPOSITORY')
    private readonly transportRepository: typeof Transport,
    @InjectModel(Route, 'GAZELLE_REPOSITORY')
    private readonly routeRepository: typeof Route,
    @InjectModel(StatusScenario, 'GAZELLE_REPOSITORY')
    private readonly statusScenarioRepository: typeof StatusScenario,

    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
    private readonly contactService: ContactService,
    private readonly transportService: TransportService,
    private readonly statusService: StatusService,
    private readonly userService: UserService,
    private readonly managementService: ManagementService,
    private readonly orderTransactionService: OrderTransactionService,
  ) {}

  async getNextStatus(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });
    const oldStatus = await this.statusRepository.findOne({
      where: { id: order.statusId },
    });
    const { status: nextStatus } = await this.calculateNextStatus(
      oldStatus,
      order.scenario,
    );
    return nextStatus;
  }

  async setNextStatus(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      include: [{ model: Transport, include: [Status] }],
    });
    if (!order) throw new NotFoundException('Order not founded!');
    const orderStats = await this.orderStatsRepository.findOne({
      where: { orderId: id },
    });

    const oldStatus = await this.statusRepository.findOne({
      where: { id: order.statusId },
    });
    const { status: nextStatus, statusScenario: nextStatusScenario } =
      await this.calculateNextStatus(oldStatus, order.scenario);

    const oldStatusDate = order.statusChangedAt;
    if (nextStatus == null || nextStatusScenario?.codeNext == null)
      return this.endOrder(order, orderStats, oldStatusDate);
    return this.moveToNextStatus(order, orderStats, oldStatusDate, nextStatus);
  }

  private async calculateNextStatus(oldStatus: Status, scenario: number) {
    if (oldStatus == null) return null;
    const statusScenario = await this.statusScenarioRepository.findOne({
      where: { code: oldStatus.code, scenario },
    });

    return {
      status: await this.statusRepository.findOne({
        where: { code: statusScenario.codeNext },
      }),
      statusScenario: await this.statusScenarioRepository.findOne({
        where: { code: statusScenario.codeNext, scenario },
      }),
    };
  }

  private async endOrder(order: Order, stats: OrderStats, oldStatusDate: Date) {
    await order.update({
      isDone: true,
      statusChangedAt: new Date(),
      statusId: (await this.statusService.findByCode(statuses.FREE.code)).id,
    });

    // OPERATOR SHIFT
    if (order.transport && order.transport.lastOperatorFullname != null) {
      const operatorShift = await this.userService.findOrStartOperatorShift(
        order.transport.lastOperatorFullname,
        order.transport.id,
      );
      await operatorShift.increment({ orderQuantity: 1 });
    }

    // CURRENT ROUTE
    const route = await this.routeRepository.findOne({
      where: { id: order.routeId },
      include: { model: Order, where: { isDeleted: false } },
      order: [
        [sequelize.col('Route.orderTime'), 'ASC'],
        [sequelize.col('orders.priority'), 'ASC'],
      ],
      subQuery: false,
    });

    // CHECK FOR NEXT ROUTE / ORDER IN ROUTE
    var newRoute: Route = route;
    var newRouteFounded = false;
    //    IF LAST ORDER IN ROUTE
    if (route.orders[route.orders.length - 1].id == order.id) {
      await route.update({ isDone: true });
      AppGateway.instance.routeDelete(route, route.orders[0]?.customerId);
      const _newRoute = await this.routeRepository.findOne({
        where: {
          transportId: order.transportId,
          isDone: false,
          isDeleted: false,
        },
        include: { model: Order, where: { isDeleted: false }, order: [] },
        order: [
          [sequelize.col('Route.orderTime'), 'ASC'],
          [sequelize.col('orders.priority'), 'ASC'],
        ],
        subQuery: false,
      });
      //    IF LAST ORDER IN ROUTE AND NEW ROUTE EXIST
      if (_newRoute) {
        newRoute = _newRoute;
        newRouteFounded = true;
      }
    }
    var nextOrder: Order;
    if (!newRouteFounded) {
      // IF IN CURRENT ROUTE AND NOT LAST ORDER
      const currentOrderIndex = newRoute.orders.findIndex(
        (o) => o.id === order.id,
      );
      nextOrder =
        newRoute.orders.length > currentOrderIndex + 1
          ? newRoute.orders[currentOrderIndex + 1]
          : null;
    } else {
      // IF IN NEXT ROUTE
      nextOrder = newRoute.orders[0];
    }
    if (nextOrder) {
      // SET NEXT ORDER TO WAIT
      await nextOrder.update({
        statusId: (await this.statusService.findByCode(statuses.WAIT.code)).id,
        statusChangedAt: new Date(),
        orderTime: nextOrder.orderTime ?? new Date(),
      });
      await AppGateway.instance.orderUpdate(nextOrder);
      // SET TRANSPORT STATUS WAIT BECAUSE ORDER EXISTS
      await this.transportService.setStatus(
        order.transportId,
        statuses.WAIT.code,
      );
    } else {
      // SET TRANSPORT STATUS FREE BECAUSE ORDER NOT EXISTS
      await this.transportService.setStatus(
        order.transportId,
        statuses.FREE.code,
      );
    }

    // UPDATE ORDER STATS
    const transport = await this.transportRepository.findOne({
      where: { id: order.transportId },
    });
    await stats.update({
      doneAt: order.statusChangedAt,
      unloadingTime: order.statusChangedAt.getTime() - oldStatusDate.getTime(),
    });

    await this.orderTransactionService.createTransactionAG(order.id);

    // SPEND LIMIT
    const customer = await this.customerService.findOne(order.customerId);
    const management = await this.managementService.findCustomerManagement(
      customer,
    );
    if (management && management.isMinutes) {
      const cargoReciever = !!order.cargoRecieverId
        ? await this.customerService.findOne(order.cargoRecieverId)
        : null;
      await this.managementService.spendLimit(
        order,
        customer,
        stats,
        cargoReciever,
      );
    }

    // END
    await AppGateway.instance.orderFinish(order);
    if (customer && customer.fcmToken) {
      await NotificationService.sendFirebaseMessage(
        customer,
        `Заказ #${order.id} завершен!`,
        'Обновление заказа!',
      );
    }
  }

  private async moveToNextStatus(
    order: Order,
    stats: OrderStats,
    oldStatusDate: Date,
    nextStatus: Status,
  ) {
    await this.transportService.setStatus(order.transportId, nextStatus.code);

    const transport = await this.transportService.findOne(order.transportId);

    await order.update({
      statusId: nextStatus.id,
      statusChangedAt: new Date(),
      orderTime: order.orderTime ?? new Date(),
    });

    await AppGateway.instance.orderUpdate(order);

    const customer = await this.customerService.findOne(order.customerId);

    const customerWithContactPhone = order.contactId
      ? await this.customerService.findOneByPhoneNumber(
          (
            await this.contactService.findOne(order.contactId)
          ).phoneNumber,
        )
      : null;

    const cargoReciever = !!order.cargoRecieverId
      ? await this.customerService.findOne(order.cargoRecieverId)
      : null;

    switch (nextStatus.code) {
      case statuses.ACCEPTED.code:
        return this.setStatusAccepted(
          stats,
          order,
          oldStatusDate,
          customer,
          transport,
          customerWithContactPhone,
          cargoReciever,
        );
      case statuses.ENTRY_TO_CUSTOMER.code:
        return this.setStatusEntryToCustomer(
          order,
          stats,
          oldStatusDate,
          customer,
          transport,
          customerWithContactPhone,
          cargoReciever,
        );
      case statuses.LOADING_START.code:
        return this.setStatusLoadingStart(
          order,
          stats,
          oldStatusDate,
          customer,
          transport,
          customerWithContactPhone,
          cargoReciever,
        );
      case statuses.LOADING_END.code:
        return this.setStatusLoadingEnd(
          order,
          stats,
          oldStatusDate,
          customer,
          transport,
          customerWithContactPhone,
          cargoReciever,
        );
      case statuses.EXIT_TO_DESTINATION.code:
        return this.setStatusExitToDestination(
          stats,
          order,
          oldStatusDate,
          customer,
          transport,
          customerWithContactPhone,
          cargoReciever,
        );
      case statuses.ENTRY_TO_DESTINATION.code:
        return this.setStatusEntryToDestination(
          order,
          stats,
          oldStatusDate,
          customer,
          transport,
          customerWithContactPhone,
          cargoReciever,
        );
      case statuses.UNLOADING_START.code:
        return this.setStatusUnloadingStart(
          order,
          stats,
          oldStatusDate,
          customer,
          transport,
          customerWithContactPhone,
          cargoReciever,
        );
    }
  }

  private async setStatusLoadingStart(
    order: Order,
    stats: OrderStats,
    oldStatusDate: Date,
    customer: Customer,
    transport: Transport,
    customerWithContactPhone: Customer,
    cargoReciever: Customer,
  ) {
    await stats.update({
      loadingStartFact: order.statusChangedAt,
      loadingWaitingTime:
        order.statusChangedAt.getTime() - oldStatusDate.getTime(),
    });
    await NotificationService.sendNotificationLoadingStart(
      customer,
      order,
      transport,
    );
    if (customerWithContactPhone && customer.id != customerWithContactPhone?.id)
      await NotificationService.sendNotificationLoadingStart(
        customerWithContactPhone,
        order,
        transport,
      );
    if (!!cargoReciever && customer.id != cargoReciever?.id && customerWithContactPhone?.id != cargoReciever?.id)
      await NotificationService.sendNotificationLoadingStart(
        cargoReciever,
        order,
        transport,
      );
  }

  private async setStatusLoadingEnd(
    order: Order,
    stats: OrderStats,
    oldStatusDate: Date,
    customer: Customer,
    transport: Transport,
    customerWithContactPhone: Customer,
    cargoReciever: Customer,
  ) {
    await stats.update({
      loadingEndFact: order.statusChangedAt,
      afterLoadingWaitingTime:
        order.statusChangedAt.getTime() - oldStatusDate.getTime(),
    });
    await NotificationService.sendNotificationLoadingEnd(
      customer,
      order,
      transport,
    );
    if (customerWithContactPhone && customer.id != customerWithContactPhone?.id)
      await NotificationService.sendNotificationLoadingEnd(
        customerWithContactPhone,
        order,
        transport,
      );
    if (!!cargoReciever && customer.id != cargoReciever?.id && customerWithContactPhone?.id != cargoReciever?.id)
      await NotificationService.sendNotificationLoadingEnd(
        cargoReciever,
        order,
        transport,
      );
  }

  private async setStatusUnloadingStart(
    order: Order,
    stats: OrderStats,
    oldStatusDate: Date,
    customer: Customer,
    transport: Transport,
    customerWithContactPhone: Customer,
    cargoReciever: Customer,
  ) {
    await stats.update({
      unloadingStartFact: order.statusChangedAt,
      unloadingWaiting:
        order.statusChangedAt.getTime() - oldStatusDate.getTime(),
    });
    await NotificationService.sendNotificationUnloadingStart(
      customer,
      order,
      transport,
    );
    if (customerWithContactPhone && customer.id != customerWithContactPhone?.id)
      await NotificationService.sendNotificationUnloadingStart(
        customerWithContactPhone,
        order,
        transport,
      );
    if (!!cargoReciever)
      await NotificationService.sendNotificationUnloadingStart(
        cargoReciever,
        order,
        transport,
      );
  }

  private async setStatusEntryToDestination(
    order: Order,
    stats: OrderStats,
    oldStatusDate: Date,
    customer: Customer,
    transport: Transport,
    customerWithContactPhone: Customer,
    cargoReciever: Customer,
  ) {
    await this.transportRepository.update(
      { placeId: order.departurePointId },
      { where: { id: order.transportId, isDeleted: false } },
    );
    await stats.update({
      entryToDestinationFact: order.statusChangedAt,
      driveTime: order.statusChangedAt.getTime() - oldStatusDate.getTime(),
    });
    await NotificationService.sendNotificationEntryToDestination(
      customer,
      order,
      transport,
    );

    if (!!cargoReciever) {
      if (customerWithContactPhone && cargoReciever?.id != customerWithContactPhone?.id)
        await NotificationService.sendNotificationEntryToDestinationCargoReciever(
          customerWithContactPhone,
          cargoReciever,
          order,
          transport,
        );
      await NotificationService.sendNotificationEntryToDestinationCargoReciever(
        cargoReciever,
        cargoReciever,
        order,
        transport,
      );
    }
  }

  private async setStatusExitToDestination(
    stats: OrderStats,
    order: Order,
    oldStatusDate: Date,
    customer: Customer,
    transport: Transport,
    customerWithContactPhone: Customer,
    cargoReciever: Customer,
  ) {
    await stats.update({
      exitToDestinationFact: order.statusChangedAt,
      loadingTime: order.statusChangedAt.getTime() - oldStatusDate.getTime(),
    });
    await NotificationService.sendNotificationExitToDestination(
      customer,
      order,
      transport,
    );
    if (customerWithContactPhone && !!cargoReciever && customerWithContactPhone?.id != cargoReciever?.id)
      await NotificationService.sendNotificationExitToDestinationCargoReciever(
        customerWithContactPhone,
        cargoReciever,
        order,
        transport,
      );
    if (!!cargoReciever && customer.id != cargoReciever?.id && customerWithContactPhone?.id != cargoReciever?.id)
      await NotificationService.sendNotificationExitToDestinationCargoReciever(
        cargoReciever,
        cargoReciever,
        order,
        transport,
      );
  }

  private async setStatusEntryToCustomer(
    order: Order,
    stats: OrderStats,
    oldStatusDate: Date,
    customer: Customer,
    transport: Transport,
    customerWithContactPhone: Customer,
    cargoReciever: Customer,
  ) {
    await this.transportRepository.update(
      { placeId: order.departurePointId },
      { where: { id: order.transportId, isDeleted: false } },
    );
    await stats.update({
      entryToCustomerFact: order.statusChangedAt,
      timeEntryToCustomer:
        order.statusChangedAt.getTime() - oldStatusDate.getTime(),
    });
    await NotificationService.sendNotificationEntryToCustomer(
      customer,
      order,
      transport,
    );
    if (customerWithContactPhone && customer.id != customerWithContactPhone?.id)
      await NotificationService.sendNotificationEntryToCustomer(
        customerWithContactPhone,
        order,
        transport,
      );
    if (!!cargoReciever && customer.id != cargoReciever?.id && customerWithContactPhone?.id != cargoReciever?.id)
      await NotificationService.sendNotificationEntryToCustomer(
        cargoReciever,
        order,
        transport,
      );
  }

  private async setStatusAccepted(
    stats: OrderStats,
    order: Order,
    oldStatusDate: Date,
    customer: Customer,
    transport: Transport,
    customerWithContactPhone: Customer,
    cargoReciever: Customer,
  ) {
    await stats.update({
      acceptedAt: order.statusChangedAt,
      timeBeforeAccepted:
        order.statusChangedAt.getTime() - oldStatusDate.getTime(),
    });
    await NotificationService.sendNotificationAccepted(
      customer,
      order,
      transport,
    );
    if (customerWithContactPhone && customer.id != customerWithContactPhone?.id)
      await NotificationService.sendNotificationAccepted(
        customerWithContactPhone,
        order,
        transport,
      );
    if (!!cargoReciever && customer.id != cargoReciever?.id && customerWithContactPhone?.id != cargoReciever?.id)
      await NotificationService.sendNotificationAccepted(
        cargoReciever,
        order,
        transport,
      );
  }

  public calculateStatus({
    order,
    isRequest,
    isDeclined,
    isApproved,
    activeOrder,
  }: {
    order: Order;
    isRequest: boolean;
    isDeclined: boolean;
    isApproved: boolean;
    activeOrder: Order;
  }) {
    if (
      !!order &&
      (order.isDone || order.isDeclined || order.isDeleted || isDeclined)
    ) {
      return undefined; // УДАЛЕНА / ОТМЕНЕНА / ЗАВЕРШЕНА
    }
    if (order && activeOrder) {
      // ОБНОВЛЕНИЕ + ЕСТЬ АКТИВНАЯ

      if (isRequest) {
        // ЗАПРОС
        if (order.isApproved && !isApproved) return statuses.REQUEST.code; // ПЕРЕВЕЛИ В ЗАПРОС
        if (!order.isApproved && isApproved) {
          // ПРИНЯЛИ
          if (order.id == activeOrder.id) {
            // ПРИНЯЛИ АКТИВНУЮ

            return statuses.WAIT.code;
          } else {
            return statuses.ORDERED.code; // ПРИНЯЛИ В ОЧЕРЕДЬ
          }
        }
      } else {
        return undefined; // НЕ МЕНЯЕМ, ДИСПЕТЧЕР ОБНОВИЛ СВОЮ ЗАЯВКУ
      }
    } else if (!order && activeOrder) {
      // СОЗДАНИЕ + ЕСТЬ АКТИВНАЯ
      if (isRequest) return statuses.REQUEST.code; // СОЗДАН ЗАПРОС
      return statuses.ORDERED.code; // СОЗДАНА ДИСПЕТЧЕРОМ НОВАЯ
    } else if (order && !activeOrder) {
      // ОБНОВЛЕНИЕ + НЕТ АКТИВНОЙ
      if (order.isRequest) {
        // ЗАПРОС ОТ ЗАКАЗЧИКА
        if (!order.isApproved && isApproved) return statuses.WAIT.code; // ПРИНЯЛИ БЕЗ АКТИВНОЙ
        if (order.isApproved && !isApproved) return statuses.REQUEST.code; // ПЕРЕВЕЛИ В ЗАПРОС
      }
      return statuses.WAIT.code; // СТАВИМ ТЕКУЩЕЙ ЗАЯВКОЙ
    } else {
      if (isRequest && !isApproved) return statuses.REQUEST.code; // СОЗДАНИЕ ЗАЯВКИ ЗАКАЗЧИКОМ, НЕТ АКТИВНОЙ
      return statuses.WAIT.code; // СОЗДАНИЕ ДИСПЕТЧЕРОМ, НЕТ АКТИВНОЙ
    }
  }
}
