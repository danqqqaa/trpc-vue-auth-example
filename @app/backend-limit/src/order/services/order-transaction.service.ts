import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Transport } from 'src/transport/transport.model';
import { OrderStats } from '../models/order-stats.model';
import { OrderTransaction } from '../models/order-transaction.model';
import { Order } from '../models/order.model';
import * as moment from 'moment';
@Injectable()
export class OrderTransactionService implements OnModuleInit {
  constructor(
    @InjectModel(OrderTransaction, 'GAZELLE_REPOSITORY')
    private readonly transactionRepository: typeof OrderTransaction,
    @InjectModel(Transport, 'GAZELLE_REPOSITORY')
    private readonly transportRepository: typeof Transport,
    @InjectModel(OrderStats, 'GAZELLE_REPOSITORY')
    private readonly statsRepository: typeof OrderStats,
    @InjectModel(Order, 'GAZELLE_REPOSITORY')
    private readonly orderRepository: typeof Order,
    @InjectConnection('GAZELLE_REPOSITORY')
    private readonly sequelizeConnection: Sequelize,
  ) {}

  onModuleInit() {
    // this.cronJob();
  }

  public async createTransactionAG(orderId: number) {
    const stats = await this.statsRepository.findOne({ where: { orderId } });
    const transport = await this.transportRepository.findOne({
      where: { transportNumber: stats.transportNumber },
    });
    if (!!stats?.entryToCustomerFact && !!transport?.agGUID) {
      try {
        const order = await this.orderRepository.findOne({
          where: { id: orderId },
        });
        await this.transactionRepository.create({
          orderId,
          startedAt: stats.entryToCustomerFact,
          doneAt: stats.doneAt,
          agGUID: transport.agGUID,
        });
        await order.update({ transactionCreated: true });
        console.log(`CREATED TRANSACTION FOR ORDER № ${orderId}`);
      } catch (error) {
        console.warn(
          `CREATION OF TRANSACTION FAILED FOR ORDER № ${orderId} err: ${error}`,
        );
      }
    } else {
      console.warn(
        `CREATION OF TRANSACTION FAILED FOR ORDER № ${orderId} startedAt: ${stats?.entryToCustomerFact}, doneAt: ${stats?.doneAt}, agGUID: ${transport?.agGUID}`,
      );
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  private async cronJob() {
    const stats = await this.sequelizeConnection.query(`SELECT  o.id
    FROM public."OrderStats" os
    JOIN public."Order"  o ON o.id = os."orderId"
    JOIN public."Transport" t on o."transportId" = t.id
    where os."entryToCustomerFact" is not null and os."doneAt" is not null and os."doneAt" < '${moment()
      .subtract(30, 'minute')
      .format()}'
    and o."routeLength" is null and o."isDone" = true and o."transportId" is not null and t."agGUID" is not null and o."transactionCreated" = false`);
    const ids = stats[0].map((i) => i['id']);
    console.log(`DETECTED ${ids.length} DEFECTED ORDERS`);
    ids.forEach(id => this.createTransactionAG(id));
  }
}
