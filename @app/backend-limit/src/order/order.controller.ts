import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { OrderService } from './services/order.service';
import { CurrentUser } from 'src/common/decorators';
import { OrderBatchDto } from './dto/order-batch.dto';
import { User } from 'src/user/user.model';
import { Customer } from 'src/customer/customer.model';
import { OrderStatusService } from './services/order-status.service';
import { Request } from 'express';

@Controller('order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly orderStatusService: OrderStatusService,
  ) {}

  @Get('route/:routeId/:currentOrderId')
  findCurrentOrder(
    @Param('routeId', ParseIntPipe) routeId: number,
    @Param('currentOrderId', ParseIntPipe) currentOrderId: number,
  ) {
    return this.orderService.findCurrentOrder(routeId, currentOrderId);
  }

  @Get('/my')
  findDriverOrder(@CurrentUser() { id }: { id: number }) {
    return this.orderService.findDriverRoute(id);
  }

  @Get('next-status/:id')
  getNextStatus(@Param('id', ParseIntPipe) id: number) {
    return this.orderStatusService.getNextStatus(id);
  }

  @Get('hierarchy/order-stats')
  getMyHierarchyOrdersStats(
    @CurrentUser() { id }: { id: number },
    @Query('onlyCurrent', ParseIntPipe) onlyCurrent: number,
  ) {
    return this.orderService.getMyHierarchyOrdersStats(id, onlyCurrent);
  }

  @Get('hierarchy/orders')
  getMyHierarchyOrders(@CurrentUser() { id }: { id: number }, year:number, month: number) {
    return this.orderService.getMyHierarchyOrders(id, year, month);
  }

  @Get('hierarchy/orders/:managementId/:year/:month')
  getManagementHierarchyOrders(
    @Param('managementId', ParseIntPipe) managementId: number,
    @Param('year', ParseIntPipe) year:number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.orderService.getManagementHierarchyOrders(managementId, year, month);
  }


  @Get('stats-dates')
  getStatsDates() {
    return this.orderService.getStatsDates();
  }

  @Get('stats')
  getStats(@Query() dates: { from: string; to: string }) {
    return this.orderService.getStats(dates);
  }

  @Get('names')
  getOrderNames() {
    return this.orderService.getOrderNames();
  }

  @Get('customer-orders/new')
  findAllCurrentCustomerNew(
    @CurrentUser() { id }: { id: number },
    @Query() query,
  ) {
    return this.orderService.findAllCurrentCustomerNew(id, query);
  }

  @Get('routes')
  findAllRoutes() {
    return this.orderService.findAllRoutes();
  }

  @Get('mvz')
  findMvz(@Query() dates: { from: string; to: string, transport: string }) {
    return this.orderService.mvz(dates);
  }

  @Get('subdivision')
  findOrderStatsSubdivision(@Query() dates: { from: string; to: string }) {
    return this.orderService.findOrderStatsSubdivision(dates);
  }

  @Get('stats-control')
  findStatsContorlLimits(
    @Query() date: { period: number; month: number; year: number; mvz: boolean },
    
  ) {
    return this.orderService.findStatsContorlLimits(date);
  }

  @Get('stats-control/hours')
  findHoursStatsControlLimits(@Query() date: { month: number; year: number }) {
    return this.orderService.findHoursStatsControlLimits(date);
  }

  @Get('indicator-stats')
  findOrdersIndicatorStats(@Query() date: { month: number; year: number }) {
    return this.orderService.findOrdersIndicatorStats(date);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.findOne(id);
  }

  @Post('batch')
  createBatch(
    @Body() orderBatchDto: OrderBatchDto,
    @CurrentUser() { id }: { id: number },
  ) {
    return this.orderService.createBatch(orderBatchDto, id);
  }

  @Patch('next-status/:id')
  nextStatus(@Param('id', ParseIntPipe) id: number) {
    return this.orderStatusService.setNextStatus(id);
  }

  @Patch('batch/:id')
  updateRoute(
    @Param('id', ParseIntPipe) id: number,
    @Body() orderBatchDto: OrderBatchDto,
    @CurrentUser() user: User | Customer,
  ) {
    return this.orderService.updateBatch(id, orderBatchDto, user);
  }

  @Patch('backToRequest/:id')
  backToRequest(
    @Param('id', ParseIntPipe) id: number,
    @Body() orderBatchDto: OrderBatchDto,
    @CurrentUser() user: User | Customer,
  ){
    return this.orderService.backToRequest(id, orderBatchDto, user);
  }

  @Patch('complete/:id')
  completeRoute(
    @Param('id', ParseIntPipe) id: number,
    @Body() orderBatchDto: OrderBatchDto,
    @CurrentUser() user: User | Customer,
  ){
    return this.orderService.completeBatch(id, orderBatchDto, user.id);
  }

  @Post('batch/:id')
  deleteRoute(
    @Param('id', ParseIntPipe) id: number,
    @Body() orderBatchDto: OrderBatchDto,
    @CurrentUser() user: User | Customer,
  ) {
    return this.orderService.deleteBatch(id, orderBatchDto,user.id);
  }
}
