/* eslint-disable prettier/prettier */
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { statuses } from 'src/status/status.service';
import { Transport } from 'src/transport/transport.model';
import { Order } from './order.model';
import sequelize, { Op } from 'sequelize';
import { Contact } from 'src/contact/contact.model';
import { Customer } from 'src/customer/customer.model';
import { Place } from 'src/place/place.model';
import { User } from 'src/user/user.model';
import { OrderStats } from './order-stats.model';
import * as moment from 'moment';
export interface IRouteCreationAttributes {
  isEmergency: boolean;
  isDone: boolean;
  isDeleted: boolean;
  isRequest: boolean;
  isApproved: boolean;
  isDeclined: boolean;
  orders: Order[];
  orderTime: Date;
  transportId: number;
  comment: string;
}

@Table({ tableName: 'Route', updatedAt: false })
export class Route extends Model<Route, IRouteCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isEmergency: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDone: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDeleted: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isRequest: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isApproved: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDeclined: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  orderTime: Date;

  @HasMany(() => Order)
  orders: Order[];

  @ForeignKey(() => Transport)
  @Column({ allowNull: true })
  transportId: number;

  @BelongsTo(() => Transport)
  transport: Transport;

  @Column({ type: DataType.STRING, allowNull: true })
  comment: string;

  findActiveOrder() {
    const order = this.orders.find((o) =>
      Object.entries(statuses)
        .filter(([key, val]) => val.isBusy)
        .map(([key, val]) => val.code)
        .includes(o.status.code),
    );
    if (order) return order;
    return this.orders[0];
  }

  static async findOperatorListRoutes() {
    return await this.findAll({
      where: { isDone: false, isDeleted: false },
      include: {
        model: Order,
        where: { isDeleted: false },
      },
      order: [
        [sequelize.col('Route.orderTime'), 'ASC'],
        [sequelize.col('orders.priority'), 'ASC'],
      ],
    });
  }

  static async findCustomerHistoryOfRoutes(customerId: number, query) {
    let filter = query?.filter?.onlyActiveOrderFlag === 'true' ? { isDeleted: false, isDone: false, [Op.or]: [{ isRequest: true, isDeclined: false }, { isRequest: false }] }
      : {
        isDeleted: false
      }
    if (query?.filter?.from && query?.filter?.to && query?.filter?.onlyActiveOrderFlag === 'false') {
      filter["createdAt"] = {
        [Op.and]: [{ [Op.gte]: query?.filter?.from }, { [Op.lte]: query?.filter?.to }]
      }
    }
    let managementId = null
    if (query?.filter?.myCustomerOrderFlag === 'true') {
      const customer = await Customer.findOne({
        where: {id: customerId}
      })
      managementId = customer.managementId
    } else {
      filter["customerId"] = customerId
    }
    let orders = []
    if (managementId) {
      orders = await Order.findAll({
        where: filter,
        include: [
          {
            model: Customer,
            foreignKey: 'cargoRecieverId',
            as: 'cargoReciever',
            where: {managementId: managementId},
          }]
      })
    } else {
      orders = await Order.findAll({
        where: filter,
        include: [
          {
            model: Customer,
            foreignKey: 'cargoRecieverId',
            as: 'cargoReciever',
          }]
      })
    }
    const routeIds = Array.from(new Set(orders.map(el => el.routeId)))
    let filter2 = { routeId: routeIds }

    const result = await this.findAll({
      subQuery: false,
      // limit: 20,
      order: [
        [sequelize.col('Route.createdAt'), 'DESC'],
        [sequelize.col('orders.priority'), 'ASC'],
      ],
      attributes: {
        include: [
          [sequelize.fn('date', sequelize.col('Route.createdAt')), 'group'],
        ],
      },
      include: [
        {
          model: Order,
          where: filter2,
          include: [
            {
              model: OrderStats,
              attributes: [
                'driverFullname',
                'driverPhoneNumber',
                'transportNumber',
              ],
            },
            { model: Contact },
            {
              model: Customer,
              foreignKey: 'customerId',
              as: 'customer',
            },
            {
              model: Customer,
              foreignKey: 'cargoRecieverId',
              as: 'cargoReciever',
            },
            {
              model: Place,
              foreignKey: 'departurePointId',
              as: 'departurePoint',
            },
            {
              model: Place,
              foreignKey: 'destinationId',
              as: 'destination',
            },
            {
              model: Transport,
              include: [{ model: User, }],
            },
          ],
        },
      ],
    });
    // if (result.length !== 0) {
    //   const ordersLastRouteResult = await this.findAll({
    //     subQuery: false,
    //     order: [
    //       [sequelize.col('Route.createdAt'), 'DESC'],
    //       [sequelize.col('orders.priority'), 'ASC'],
    //     ],
    //     attributes: {
    //       include: [
    //         [sequelize.fn('date', sequelize.col('Route.createdAt')), 'group'],
    //       ],
    //     },
    //     include: [
    //       {
    //         model: Order,
    //         where: { ...filter, routeId: result[result.length - 1].id },
    //         include: [
    //           {
    //             model: OrderStats,
    //             attributes: [
    //               'driverFullname',
    //               'driverPhoneNumber',
    //               'transportNumber',
    //             ],
    //           },
    //           { model: Contact },
    //           {
    //             model: Customer,
    //             foreignKey: 'customerId',
    //             as: 'customer',
    //           },
    //           {
    //             model: Customer,
    //             foreignKey: 'cargoRecieverId',
    //             as: 'cargoReciever',
    //           },
    //           {
    //             model: Place,
    //             foreignKey: 'departurePointId',
    //             as: 'departurePoint',
    //           },
    //           {
    //             model: Place,
    //             foreignKey: 'destinationId',
    //             as: 'destination',
    //           },
    //           {
    //             model: Transport,
    //             include: [{ model: User, }],
    //           },
    //         ],
    //       },
    //     ],
    //   });
    //   const newResult = result.map((el) => { if (el.id == ordersLastRouteResult[0].id) { return ordersLastRouteResult[0] } return el })
    //   return newResult
    // }
    return result
  }

  static async myHierarchyOrdersStats(userId: number, onlyCurrent: boolean) {
    const where = onlyCurrent
      ? {
        [Op.and]: [
          {
            orderTime: {
              [Op.between]: [
                moment()
                  .startOf('month')
                  .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                  .toDate(),
                moment()
                  .endOf('month')
                  .set({
                    hour: 23,
                    minute: 59,
                    second: 59,
                    millisecond: 999,
                  })
                  .toDate(),
              ],
            },
          },
          { orderTime: { [Op.not]: null } },
        ],
      }
      : { orderTime: { [Op.not]: null } };
    return await this.findAll({
      attributes: ['loadingTime', 'driveTime', 'unloadingTime'],
      order: [[sequelize.col('order.orderTime'), 'desc']],

      include: {
        model: Order,
        where: {
          ...where,
          isDone: true,
          isDeleted: false,
          customerId: userId,
        },
        attributes: ['orderTime', 'id', 'routeLength'],
      },
    });
  }


}
