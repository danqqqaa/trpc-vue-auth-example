import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Contact } from './contact/contact.model';
import { Customer } from './customer/customer.model';
import { CustomerService } from './customer/customer.service';
import { Order } from './order/models/order.model';
import { OrderService } from './order/services/order.service';
import { Place } from './place/place.model';
import { Transport } from './transport/transport.model';
import { TransportService } from './transport/transport.service';
import { User } from './user/user.model';
import { forwardRef, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { Management } from './management/management.model';
import { Hierarchy } from './limit/hierarchy.model';
import { LimitRequest } from './limit/limit-request.model';
import { Route } from './order/models/route.model';
import { ManagementService } from './management/management.service';
import { UserService } from './user/user.service';
import { Config } from './recommendation/models/config.model';

interface MemoryUsageUnit {
  min: number;
  max: number;
  current: number;
}

interface MemoryUsage {
  rss: MemoryUsageUnit;
  heapTotal: MemoryUsageUnit;
  heapUsed: MemoryUsageUnit;
  external: MemoryUsageUnit;
  arrayBuffers: MemoryUsageUnit;
}

@WebSocketGateway({
  path: '/ws',
  serveClient: true,
  cors: true,
})
export class AppGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  @Cron(CronExpression.EVERY_5_SECONDS)
  _checkMemoryUsage() {
    this.checkMemoryUsage();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  handleCron() {
    this.memUse();
  }

  private memoryStats: MemoryUsage;

  private checkMemoryUsage() {
    const memoryData = Object.fromEntries(
      Object.entries(process.memoryUsage()).map(([key, val]) => [
        key,
        val / 1048576,
      ]),
    ) as {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
    Object.entries(memoryData).forEach(([key, val]) => {
      this.memoryStats[key].min = this.memoryStats[key].min
        ? val < this.memoryStats[key].min
          ? val
          : this.memoryStats[key].min
        : val;
      this.memoryStats[key].max = this.memoryStats[key].max
        ? val > this.memoryStats[key].max
          ? val
          : this.memoryStats[key].max
        : val;
      this.memoryStats[key].current = val;
    });
  }

  private memUse() {
    var message = `==============================================================\nMemory usage: ${moment().format(
      'DD.MM.YYYY hh:mm:ss',
    )}\n`;
    Object.entries(this.memoryStats).forEach(([key, val]) => {
      message += `\t${key}:\n`;
      Object.entries(val).forEach(
        ([vkey, vval]: [key: string, val: number]) => {
          message += `\t\t${vkey}: ${vval.toFixed(2)} MB\n`;
        },
      );
    });
    message += '==============================================================';
    console.log(message);
  }

  constructor(
    private readonly orderService: OrderService,
    @Inject(forwardRef(() => CustomerService))
    private readonly customerService: CustomerService,
    private readonly transportService: TransportService,
    private readonly managementService: ManagementService,
    private readonly userService: UserService,
  ) {}

  static instance: AppGateway;

  afterInit(server: any) {
    if (AppGateway.instance == null) AppGateway.instance = this;
    this.server.removeAllListeners();
    this.memoryStats = {
      rss: {
        min: null,
        max: null,
        current: null,
      },
      heapTotal: {
        min: null,
        max: null,
        current: null,
      },
      heapUsed: {
        min: null,
        max: null,
        current: null,
      },
      external: {
        min: null,
        max: null,
        current: null,
      },
      arrayBuffers: {
        min: null,
        max: null,
        current: null,
      },
    };
    this.checkMemoryUsage();
    this.memUse();
    // this.handleOrderPathUpdate(null, 80)
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('order_path_update')
  async handleOrderPathUpdate(client: any, payload: any) {
    const order = await this.orderService.findOne(payload);
    const stats = await this.orderService.findOrderStats(order.id);
    const transport = await this.transportService.findOne(order.transportId);

    // UPDATE DRIVER STATS
    const shift = await this.userService.findCurrentShift(
      transport.driverId,
      true,
    );
    if (shift) await shift.addFromStats(stats, order);

    // SPEND LIMIT
    const customer = await this.customerService.findOne(order.customerId);
    const cargoReciever = !!order.cargoRecieverId
      ? await this.customerService.findOne(order.cargoRecieverId)
      : null;
    await this.managementService.spendLimit(
      order,
      customer,
      stats,
      cargoReciever,
    );
    await this.orderUpdate(order);
  }

  private broadcast(event: string, message?: any) {
    this.server.sockets.emit(event, message);
  }

  userCreate(user: User) {
    this.broadcast(`user_create:${user.role}`, user);
  }

  userUpdate(user: User) {
    this.userWithoutMobileUpdate(user);
    this.broadcast(`user_update:${user.role}:${user.id}`, user);
  }

  userWithoutMobileUpdate(user: User) {
    this.broadcast('user_update', user);
    this.broadcast(`user_update:${user.role}`, user);
  }

  userDelete(user: User) {
    this.broadcast('user_delete', user.id);
    this.broadcast(`user_delete:${user.role}`, user.id);
    this.broadcast(`user_delete:${user.role}:${user.id}`, user.id);
  }

  transportUpdate(transport: Transport) {
    this.broadcast('transport_update', transport);
    this.broadcast(`transport_update:${transport.id}`, transport);
  }

  freeTransportType(transport: Transport) {
    this.broadcast('free_transport_type', transport);
  }

  clearPositionTransport(transport: Transport) {
    this.broadcast('transport_update', transport);
  }

  transportDelete(transport: Transport) {
    this.broadcast('transport_delete', transport.id);
    this.broadcast(`transport_delete:${transport.id}`, transport.id);
  }

  transportCreate(transport: Transport) {
    this.broadcast('transport_create', transport);
  }

  transportFree(transport: Transport) {
    this.broadcast('transport_free', transport);
  }

  configChanged(config: Config) {
    this.broadcast('config_update', config);
  }

  async orderUpdate(order: Order) {
    this.broadcast(`order_update`, order);
    this.broadcast(`order_update:customer:${order.customerId}`, order);
    const customer = await this.customerService.findOne(order.customerId);
    const stats = await this.orderService.findOrderStats(order.id);
    // this.broadcast(`order_update:customernew:${customer.id}`, stats);
    this.broadcast(
      `order_update:customernewsubdivision:${customer.subdivision}`,
      stats,
    );
    return { order, customer, stats };
  }

  async orderFinish(order: Order) {
    this.broadcast('order_delete', order.id);
    this.broadcast('order_update', order);
    this.broadcast(`order_update_done`, order);
    this.broadcast(`order_complete`, order);

    // this.broadcast(`order_delete:customernew:${order.customerId}`, order.id);
    const customer = await this.customerService.findOne(order.customerId);
    this.broadcast(
      `order_delete:customernewsubdivision:${customer.subdivision}`,
      order.id,
    );
  }

  async orderCreate(order: Order) {
    this.broadcast(`order_create`, order);
    this.broadcast(`order_create:customer:${order.customerId}`, order);
    const customer = await this.customerService.findOne(order.customerId);
    const stats = await this.orderService.findOrderStats(order.id);
    // this.broadcast(`order_create:customernew:${customer.id}`, stats);
    this.broadcast(
      `order_create:customernewsubdivision:${customer.subdivision}`,
      stats,
    );
    return { order, customer, stats };
  }

  async driverOrderCreated(driverId: number) {
    const order = await this.transportService.findDriverRoute(driverId);
    this.broadcast(`order_create:${driverId}`, order);
    return { order };
  }

  async driverOrderUpdated(driverId: number) {
    const order = await this.transportService.findDriverRoute(driverId);
    this.broadcast(`order_update:${driverId}`, order);
    return { order };
  }

  placeCreate(place: Place) {
    this.broadcast('place_create', place);
  }

  placeUpdate(place: Place) {
    this.broadcast('place_update', place);
  }

  placeDelete(place: Place) {
    this.broadcast('place_delete', place.id);
  }

  customerCreate(customer: Customer) {
    this.broadcast('customer_create', customer);
  }

  customerUpdate(customer: Customer) {
    this.broadcast('customer_update', customer);
  }

  customerDelete(customer: Customer) {
    this.broadcast('customer_delete', customer.id);
  }

  contactCreate(contact: Contact) {
    this.broadcast('contact_create', contact);
  }

  contactUpdate(contact: Contact) {
    this.broadcast('contact_update', contact);
  }

  contactDelete(contact: Contact) {
    this.broadcast('contact_delete', contact.id);
  }

  managementUpdate(management: Management) {
    this.broadcast('management_update', management);
  }

  hierarchyUpdate(hierarchy: Hierarchy) {
    this.broadcast('hierarchy_update', hierarchy);
  }

  hierarchyReset() {
    this.broadcast('hierarchy_reset');
  }

  limitRequestUpdate(lr: LimitRequest) {
    this.broadcast('limit_request_update', lr);
  }

  routeCreate(route: Route) {
    this.broadcast('route_create', route);
  }

  routeUpdate(route: Route, customerId: number) {
    this.broadcast('route_update', route);
    this.broadcast(`order_update:customernew:${customerId}`, route);
  }

  routeDelete(route: Route, customerId: number) {
    this.broadcast('route_delete', route.id);
    this.broadcast(`order_delete:customernew:${customerId}`, route);
  }

  routeComplete(route: Route, customerId: number) {
    this.broadcast('route_complete', route.id);
    this.broadcast(`order_complete:customernew:${customerId}`, route);
  }
}
