import { Op } from 'sequelize';
import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasOne,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';
import { Contact } from 'src/contact/contact.model';
import { Customer } from 'src/customer/customer.model';
import { Place } from 'src/place/place.model';
import { Status } from 'src/status/status.model';
import { Transport } from 'src/transport/transport.model';
import { User } from 'src/user/user.model';
import { OrderStats } from './order-stats.model';
import { Route } from './route.model';
import { CargoType } from 'src/recommendation/models/cargo-type.model';

export interface IOrderCreationAttributes {
  orderTime: Date;
  departurePointId: number;
  destinationId: number;
  isEmergency: boolean;
  passengerCount: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  customerId: number;
  cargoRecieverId: number;
  contactId: number;
  transportId: number;
  name: string;
  description?: string;
  statusId: number;
  statusChangedAt: Date;
  isRequest: boolean;
  isApproved: boolean;
  isDeclined: boolean;
  priority: number;
  routeLength: number;
  coordinatesHistory: string[];
  parentOrder: number;
  routeId: number;
  transactionCreated: boolean;
  cargoTypeId: number;
}

@DefaultScope(() => ({
  attributes: { exclude: ['coordinatesHistory'] },
}))
@Scopes(() => ({
  full: {},
}))
@Table({ tableName: 'Order', updatedAt: false })
export class Order extends Model<Order, IOrderCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.DATE, allowNull: true, defaultValue: Date.now })
  orderedAt?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  orderTime: Date;

  @ForeignKey(() => Place)
  @Column
  departurePointId: number;

  @BelongsTo(() => Place, 'departurePointId')
  departurePoint: Place;

  @ForeignKey(() => Place)
  @Column
  destinationId: number;

  @BelongsTo(() => Place, 'destinationId')
  destination: Place;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isEmergency: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false })
  passengerCount: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  weight: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  length: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  width: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  height: number;

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

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: () => [],
  })
  coordinatesHistory: string[];

  @Column({ type: DataType.INTEGER, allowNull: true })
  routeLength: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  parentOrder: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @ForeignKey(() => Customer)
  @Column
  cargoRecieverId: number;

  @BelongsTo(() => Customer, 'cargoRecieverId')
  cargoReciever: Customer;

  @ForeignKey(() => Customer)
  @Column
  customerId: number;

  @BelongsTo(() => Customer, 'customerId')
  customer: Customer;

  @ForeignKey(() => Contact)
  @Column({ allowNull: true })
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Transport)
  @Column({ allowNull: true })
  transportId: number;

  @BelongsTo(() => Transport)
  transport: Transport;

  @ForeignKey(() => Status)
  @Column({ allowNull: true })
  statusId: number;

  @BelongsTo(() => Status)
  status: Status;

  @Column({ type: DataType.DATE, allowNull: true })
  statusChangedAt: Date;

  @Column({ type: DataType.BIGINT, allowNull: true })
  priority: number;

  @ForeignKey(() => Route)
  @Column({ allowNull: true })
  routeId: number;

  @BelongsTo(() => Route)
  route: Route;

  @HasOne(() => OrderStats)
  stats: OrderStats;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  scenario: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  transactionCreated: boolean;

  @ForeignKey(() => CargoType)
  @Column({ allowNull: true })
  cargoTypeId: number;

  @BelongsTo(() => CargoType)
  cargoType: CargoType;

  // ALTER TABLE IF EXISTS public."Order"
  //   ADD COLUMN "cargoTypeId" integer;
	
  // ALTER TABLE IF EXISTS public."Order"
  //   ADD CONSTRAINT "Order_cargoTypeId_fkey" FOREIGN KEY ("cargoTypeId")
  //   REFERENCES public."CargoType" (id) MATCH SIMPLE
  //   ON UPDATE CASCADE
  //   ON DELETE SET NULL;

  async changeStatus(statusId: number) {
    await this.update({
      statusId: statusId,
      statusChangedAt: new Date(),
      orderTime: this.orderTime ?? new Date(),
    });
  }

  static async findCurrentOrder(routeId: number, currentOrderId: number) {
    return await this.findAll({
      where: {
        id: {
          [Op.gt]: currentOrderId,
        },
        routeId: routeId,
        isDeleted: false,
        isDone: false,
      },
      order: [['priority', 'asc']],
      include: [
        Contact,
        {
          model: Customer,
          foreignKey: 'cargoRecieverId',
          as: 'cargoReciever',
        },
        { model: Customer, foreignKey: 'customerId', as: 'customer' },
        { model: Place, foreignKey: 'departurePointId', as: 'departurePoint' },
        { model: Place, foreignKey: 'destinationId', as: 'destination' },
        { model: Transport, include: [Status] },
      ],
    });
  }
}
