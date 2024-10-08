import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Place } from 'src/place/place.model';
import { Order } from './order.model';
import * as moment from 'moment';
import { Contact } from 'src/contact/contact.model';
import { Customer } from 'src/customer/customer.model';
import sequelize, { Op } from 'sequelize';
import { Transport } from 'src/transport/transport.model';
import { User } from 'src/user/user.model';
import { Status } from 'src/status/status.model';
import { Route } from './route.model';
import { CargoType } from 'src/recommendation/models/cargo-type.model';
import { TransportType } from 'src/recommendation/models/transport-type.model';

export interface IOrderStatsCreationAttributes {
  orderId: number;
  timeBetweenOrders: number;
  placeId: number;
  transportNumber: string;
  transportType: string;
  driverFullname: string;
  driverPhoneNumber: string;
  operatorFullname: string;
  isDeleted: boolean;
  deletedByFullname: string;
  loadingStartFact: Date;
  loadingEndFact: Date;
  unloadingStartFact: Date;
  loadingWaitingTime: number;
  afterLoadingWaitingTime: number;
  unloadingWaiting: number;
  cargoSenderLimit: number;
  cargoRecieverLimit: number;
}

@Table({ tableName: 'OrderStats', updatedAt: false })
export class OrderStats extends Model<
  OrderStats,
  IOrderStatsCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Order)
  @Column
  orderId: number;

  @BelongsTo(() => Order)
  order: Order;

  @Column({ type: DataType.DATE, allowNull: true })
  acceptedAt: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  loadingStartFact: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  loadingEndFact: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  entryToCustomerFact: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  exitToDestinationFact: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  entryToDestinationFact: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  unloadingStartFact: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  doneAt: Date;

  @Column({ type: DataType.BIGINT, allowNull: true })
  timeBetweenOrders: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  timeBeforeAccepted: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  timeEntryToCustomer: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  loadingTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  driveTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  unloadingTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  loadingWaitingTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  afterLoadingWaitingTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  unloadingWaiting: number;

  @BelongsTo(() => Place)
  place: Place;

  @ForeignKey(() => Place)
  @Column({ allowNull: true })
  placeId: number;

  @Column({ type: DataType.STRING, allowNull: false })
  transportNumber: string;

  @Column({ type: DataType.STRING, allowNull: false })
  transportType: string;

  @Column({ type: DataType.STRING, allowNull: false })
  driverFullname: string;

  @Column({ type: DataType.STRING, allowNull: false })
  driverPhoneNumber: string;

  @Column({ type: DataType.STRING, allowNull: true })
  operatorFullname: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDeleted: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  deletedByFullname: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  cargoSenderLimit: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  cargoRecieverLimit: number;

  static async myHierarchyOrders(
    customerIds: number[],
    year: number,
    month: number,
  ) {
    return {
      orders: await this.findAll({
        attributes: [
          'driveTime',
          'unloadingTime',
          'unloadingWaiting',
          'loadingWaitingTime',
          'loadingTime',
          'afterLoadingWaitingTime',
        ],
        order: [[sequelize.col('order.orderTime'), 'desc']],

        include: {
          model: Order,
          include: [
            {
              model: Route,
              attributes: ['id', 'comment'],
              foreignKey: 'routeId',
              as: 'route',
            },
            {
              model: Customer,
              attributes: ['fullname'],
              foreignKey: 'customerId',
              as: 'customer',
            },
            {
              model: Customer,
              attributes: ['fullname'],
              foreignKey: 'cargoRecieverId',
              as: 'cargoReciever',
            },
          ],
          where: {
            [Op.or]: [
              { customerId: customerIds },
              { cargoRecieverId: customerIds },
            ],
            isDone: true,
            [Op.and]: [
              {
                orderTime: {
                  [Op.between]: [
                    moment(`${month + 1}-${year}`, 'M-YYYY')
                      .startOf('month')
                      // .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
                      .format(),
                    moment(`${month + 1}-${year}`, 'M-YYYY')
                      .endOf('month')
                      // .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
                      .format(),
                  ],
                },
              },
              { orderTime: { [Op.not]: null } },
            ],
          },
          attributes: [
            'orderTime',
            'id',
            'routeLength',
            'customerId',
            'cargoRecieverId',
          ],
        },
      }),
      customerIds,
    };
  }

  static async getStats(dates: { from: string; to: string }) {
    return await this.findAll({
      order: [['orderId', 'asc']],
      attributes: [
        'orderId',
        'operatorFullname',
        'acceptedAt',
        'entryToCustomerFact',
        'exitToDestinationFact',
        'entryToDestinationFact',
        'transportNumber',
        'transportType',
        'driverFullname',
        'driverPhoneNumber',
        'doneAt',
        'timeBetweenOrders',
        'timeBeforeAccepted',
        'timeEntryToCustomer',
        'loadingTime',
        'driveTime',
        'unloadingTime',
        'isDeleted',
        'deletedByFullname',
        'loadingStartFact',
        'loadingEndFact',
        'unloadingStartFact',
        'loadingWaitingTime',
        'afterLoadingWaitingTime',
        'unloadingWaiting',
        'cargoSenderLimit',
        'cargoRecieverLimit',
      ],
      include: [
        {
          model: Place,
          attributes: ['name'],
        },
        {
          model: Order,
          attributes: [
            'routeLength',
            'isDeleted',
            'isDeclined',
            'name',
            'description',
            'orderedAt',
            'orderTime',
            'passengerCount',
            'weight',
            'length',
            'width',
            'height',
            'isRequest',
            'isEmergency',
            'cargoTypeId',
          ],
          where: {
            isDone: true,
            orderTime: {
              [Op.between]: [
                moment(dates.from, 'DD.MM.YYYY HH:mm')
                  .set({ second: 0, millisecond: 0 })
                  .toDate(),
                moment(dates.to, 'DD.MM.YYYY HH:mm')
                  .set({ second: 59, millisecond: 999 })
                  .toDate(),
              ],
            },
          },
          include: [
            {
              model: Route,
              attributes: ['id', 'comment'],
              foreignKey: 'routeId',
              as: 'route',
            },
            {
              model: Contact,
              attributes: ['fullname', 'phoneNumber'],
            },
            {
              model: Customer,
              attributes: ['subdivision', 'fullname', 'phoneNumber'],
              foreignKey: 'customerId',
              as: 'customer',
            },
            {
              model: Customer,
              attributes: ['subdivision', 'fullname', 'phoneNumber'],
              foreignKey: 'cargoRecieverId',
              as: 'cargoReciever',
            },
            {
              model: Place,
              foreignKey: 'departurePointId',
              as: 'departurePoint',
              attributes: ['name'],
            },
            {
              model: Place,
              foreignKey: 'destinationId',
              as: 'destination',
              attributes: ['name'],
            },
          ],
        },
      ],
    });
  }

  static async getStatsMvz(dates: {
    from: string;
    to: string;
    transport: string;
  }) {
    const stats = await this.findAll({
      // logging: true,
      order: [['orderId', 'asc']],
      attributes: [
        'orderId',
        'operatorFullname',
        'acceptedAt',
        'entryToCustomerFact',
        'exitToDestinationFact',
        'entryToDestinationFact',
        'transportNumber',
        'transportType',
        'driverFullname',
        'driverPhoneNumber',
        'doneAt',
        'timeBetweenOrders',
        'timeBeforeAccepted',
        'timeEntryToCustomer',
        'loadingTime',
        'driveTime',
        'unloadingTime',
        'isDeleted',
        'deletedByFullname',
        'loadingStartFact',
        'loadingEndFact',
        'unloadingStartFact',
        'loadingWaitingTime',
        'afterLoadingWaitingTime',
        'unloadingWaiting',
        'cargoSenderLimit',
        'cargoRecieverLimit',
      ],
      include: [
        {
          model: Order,
          attributes: ['customerId', 'cargoRecieverId'],
          where: {
            isDone: true,
            orderTime: {
              [Op.between]: [
                moment(dates.from, 'DD.MM.YYYY')
                  .subtract(1, 'days')
                  .set({ hour: 19, minute: 30, second: 0, millisecond: 0 })
                  .toDate(),
                moment(dates.to, 'DD.MM.YYYY')
                  .set({ hour: 19, minute: 30, second: 0, millisecond: 0 })
                  .toDate(),
              ],
            },
          },
          include: [
            {
              model: Customer,
              attributes: [
                'id',
                'subdivision',
                'fullname',
                'phoneNumber',
                'mvz',
              ],
              foreignKey: 'customerId',
              as: 'customer',
              where: {
                mvz: {
                  [Op.ne]: null,
                },
              },
            },
            {
              model: Customer,
              attributes: [
                'id',
                'subdivision',
                'fullname',
                'phoneNumber',
                'mvz',
              ],
              foreignKey: 'cargoRecieverId',
              as: 'cargoReciever',
            },
            {
              model: Transport,
              attributes: ['mvz'],
              include: [{ model: TransportType, attributes: [] }],
            },
          ],
        },
      ],
    });
    const mvz = {};

    const processMvz = (mvzKey, limit) => {
      mvz.hasOwnProperty(mvzKey) ? (mvz[mvzKey] += limit) : (mvz[mvzKey] = limit);
    };

    const isValidMvz = (mvz: string) => mvz !== '3830200';

    stats.forEach((el) => {
      const { customer, cargoReciever, transport } = el.order;
      const cargoRecieverMvz = cargoReciever?.mvz;
      const customerMvz = customer.mvz;

      if (isValidMvz(customerMvz) && isValidMvz(cargoRecieverMvz)) {
        if (dates.transport === 'true') {
          const transportMvz = transport?.mvz;
          const totalLimit = el.cargoRecieverLimit + el.cargoSenderLimit;
          if (transportMvz) processMvz(transportMvz, totalLimit);
        } else {
          if (cargoRecieverMvz) processMvz(cargoRecieverMvz, el.cargoRecieverLimit);
          processMvz(customerMvz, el.cargoSenderLimit);
        }
      }
    });
    delete mvz['3830200'];
    delete mvz['undefined'];
    delete mvz['null'];


  return mvz
  }

  static async getStatsForOrder(orderId: number) {
    return this.findOne({
      where: {
        orderId: orderId,
      },
      include: [
        Place,
        {
          model: Order,
          include: [
            Contact,
            { model: Customer, foreignKey: 'customerId', as: 'customer' },
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
              include: [User],
            },
          ],
        },
      ],
    });
  }

  static async getStatsSubdivision(dates: { from: string; to: string }) {
    const orders = await Order.findAll({
      attributes: ['id'],
      where: {
        isDone: true,
        orderTime: {
          [Op.between]: [
            moment(dates.from, 'DD.MM.YYYY HH:mm')
              .set({ second: 0, millisecond: 0 })
              .toDate(),
            moment(dates.to, 'DD.MM.YYYY HH:mm')
              .set({ second: 59, millisecond: 999 })
              .toDate(),
          ],
        },
      },
      include: [
        { model: Route },
        {
          model: Customer,
          attributes: ['subdivision'],
          foreignKey: 'customerId',
          as: 'customer',
        },
      ],
    });
    // return orders
    const counts = orders.reduce(
      (acc, item) => {
        const subdivision = item.customer.subdivision;
        const isDeleted = item.route?.isDeleted;
        const isDone = item.route?.isDone;
        const isDeclined = item.route?.isDeclined;

        acc.subdivisionCounts[subdivision] =
          (acc.subdivisionCounts[subdivision] || 0) + 1;

        acc.orders[subdivision] = acc.orders[subdivision] || {
          total: 0,
          isDeleted: 0,
          isDone: 0,
          isDeclined: 0,
        };

        acc.orders[subdivision].total += 1;
        acc.orders[subdivision].isDeleted += isDeleted ? 1 : 0;
        acc.orders[subdivision].isDone += isDone ? 1 : 0;
        acc.orders[subdivision].isDeclined += isDeclined ? 1 : 0;

        return acc;
      },
      { subdivisionCounts: {}, orders: {} },
    );

    const resultArray = Object.entries(counts.subdivisionCounts).map(
      ([subdivision, count]) => ({
        subdivision,
        count,
        isDeleted: counts.orders[subdivision]
          ? counts.orders[subdivision].isDeleted
          : 0,
        isDone: counts.orders[subdivision]
          ? counts.orders[subdivision].isDone -
            counts.orders[subdivision].isDeclined -
            counts.orders[subdivision].isDeleted
          : 0,
        isDeclined: counts.orders[subdivision]
          ? counts.orders[subdivision].isDeclined
          : 0,
      }),
    );
    return resultArray;
  }

  static async getStatsControlLimits(date: {
    period: number;
    month: number;
    year: number;
    mvz?: boolean;
  }) {
    let from;
    let to;
    if (date.period == 0) {
      from = moment()
        .set({
          year: date.year,
          month: date.month,
          date: 1,
          hour: 19,
          minute: 30,
          second: 0,
          millisecond: 0,
        })
        .subtract({ days: 1 })
        .toDate();
      to = moment()
        .set({
          year: date.year,
          month: date.month,
          date: 14,
          hour: 19,
          minute: 30,
          second: 0,
          millisecond: 0,
        })
        .toDate();
    }
    if (date.period == 1) {
      from = moment()
        .set({
          year: date.year,
          month: date.month,
          date: 14,
          hour: 19,
          minute: 30,
          second: 0,
          millisecond: 0,
        })
        .toDate();
      to = moment()
        .set({
          year: date.year,
          month: date.month,
          date: 20,
          hour: 19,
          minute: 30,
          second: 0,
          millisecond: 0,
        })
        .toDate();
    }

    if (date.period == 2) {
      from = moment()
        .set({
          year: date.year,
          month: date.month,
          date: 20,
          hour: 19,
          minute: 30,
          second: 0,
          millisecond: 0,
        })
        .toDate();
      to = moment()
        .set({
          year: date.year,
          month: date.month,
        })
        .endOf('month')
        .set({ hour: 19, minute: 30, second: 0, millisecond: 0 })
        .toDate();
    }

    const stats = await Order.findAll({
      order: [['orderTime', 'asc']],
      attributes: ['id', 'routeLength', 'orderTime'],
      where: {
        orderTime: {
          [Op.between]: [from, to],
        },
      },
      include: [
        {
          model: Customer,
          attributes: ['subdivision'],
          foreignKey: 'customerId',
          as: 'customer',
          where: {
            subdivision: 'УС',
          },
        },
        {
          model: OrderStats,
          attributes: ['transportNumber'],
        },
        {
          model: Transport,
          attributes: ['mvz'],
          include: [{ model: TransportType, attributes: [] }],
        },
      ],
    });

    const filteredStats = stats.reduce((result, obj) => {
      const existingObjIndex = result.findIndex((item) =>
        String(date.mvz) === 'true'
          ? item.transport?.mvz === obj.transport?.mvz
          : item.stats.transportNumber === obj.stats.transportNumber &&
            moment(item.orderTime).isSame(moment(obj.orderTime), 'day'),
      );
      if (existingObjIndex !== -1) {
        result[existingObjIndex].routeLength += obj.routeLength;
      } else if (obj.routeLength !== null) {
        result.push(JSON.parse(JSON.stringify(obj)));
      }

      return result;
    }, []);

    return filteredStats;
  }
  static async getHoursStatsControlLimits(date: {
    month: number;
    year: number;
  }) {
    const from = moment()
      .set({
        year: date.year,
        month: date.month,
        date: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      .toDate();
    const to = moment()
      .set({
        year: date.year,
        month: date.month,
      })
      .endOf('month')
      .toDate();

    const stats = await Order.findAll({
      attributes: ['routeLength'],
      where: {
        orderTime: {
          [Op.between]: [from, to],
        },
      },
      include: [
        {
          model: Customer,
          attributes: ['subdivision'],
          foreignKey: 'customerId',
          as: 'customer',
          where: {
            subdivision: 'УС',
          },
        },
      ],
    });
    const sumRouteLength = stats.reduce((sum, item) => {
      if (item.routeLength !== null) {
        return sum + item.routeLength;
      } else {
        return sum;
      }
    }, 0);

    return sumRouteLength / 1000;
  }

  static async getIndicatorStats(date: { month: number; year: number }) {
    const from = moment()
      .set({
        year: date.year,
        month: date.month,
        date: 1,
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      .toDate();
    const to = () => {
      const currentDate = moment();
      const endOfMonth = moment()
        .set({
          year: date.year,
          month: date.month,
        })
        .endOf('month');
      const endOfPreviousDay = moment(currentDate)
        .subtract(1, 'day')
        .endOf('day');

      return currentDate.isSame(endOfMonth, 'month')
        ? endOfPreviousDay.toDate()
        : endOfMonth.toDate();
    };

    const stats = await Order.findAll({
      order: [['orderTime', 'asc']],
      attributes: [
        'id',
        'orderTime',
        'isDone',
        'isDeleted',
        'isDeclined',
        'isRequest',
      ],
      where: {
        isDone: true,
        orderTime: {
          [Op.between]: [from, to()],
        },
      },
      include: [
        {
          model: CargoType,
          attributes: ['priority'],
          foreignKey: 'cargoTypeId',
          as: 'cargoType',
        },
        {
          model: OrderStats,
          attributes: ['entryToCustomerFact', 'deletedByFullname'],
        },
      ],
    });

    const isDone = (m) =>
      m.isDone && !m.isDeleted && !(m.isRequest && m.isDeclined);

    const isDoneLate = (m) =>
      Math.abs(
        moment(m.orderTime).diff(
          moment(m.stats.entryToCustomerFact),
          'hour',
          true,
        ),
      ) > 2;

    const formatPercentage = (m) => Number((100 * m).toFixed(2));
    const includesDeleted = (m) => m.stats.deletedByFullname === null;
    const count = (_) => {
      const result = [];
      _.forEach((m) => {
        const date = moment(m.orderTime).format('YYYY-MM-DD');
        const obj = result.find((res) => res.date === date);

        if (obj) {
          includesDeleted(m) ? obj.length++ : 0;
          m.cargoType?.priority == 3 && includesDeleted(m)
            ? obj.priorityLength++
            : 0;
          // isDone(m) ? obj.isDone++ : 0;
          m.stats.deletedByFullname?.includes('Диспетчер')
            ? obj.isDeleted++
            : 0;
          // m.cargoType?.priority == 3 && isDone(m) ? obj.isDonePriority++ : 0;
          m.stats.deletedByFullname?.includes('Диспетчер') &&
          m.cargoType?.priority == 3
            ? obj.isDeletedPriority++
            : 0;
          m.cargoType?.priority == 3 && isDone(m) && isDoneLate(m)
            ? obj.priorityLateLength++
            : 0;
        } else {
          result.push({
            date: date,
            length: includesDeleted(m) ? 1 : 0,
            priorityLength:
              includesDeleted(m) && m.cargoType?.priority == 3 ? 1 : 0,
            // isDone: isDone(m) ? 1 : 0,
            // isDonePriority: m.cargoType?.priority == 3 && isDone(m) ? 1 : 0,
            isDeleted: m.stats.deletedByFullname?.includes('Диспетчер') ? 1 : 0,
            isDeletedPriority:
              m.stats.deletedByFullname?.includes('Диспетчер') &&
              m.cargoType?.priority == 3
                ? 1
                : 0,
            priorityLateLength:
              m.cargoType?.priority == 3 && isDone(m) && isDoneLate(m) ? 1 : 0,
          });
        }
      });

      const res = result.map((m) => ({
        date: m.date,
        length: m.length,
        priorityLength: m.priorityLength,
        priorityLateLength: m.priorityLateLength,
        overallPercentage: formatPercentage(
          (m.length - m.isDeleted) / m.length,
        ),
        priorityPercentage: formatPercentage(
          (m.priorityLength - m.isDeletedPriority) / m.priorityLength,
        ),
        percentageLate: formatPercentage(
          (m.length - m.priorityLateLength) / m.length,
        ),
      }));

      return res;
    };
    const result = count(stats);

    return result;
  }
}
