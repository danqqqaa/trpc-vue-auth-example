import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface IOrderTransactionCreationAttributes {
  orderId: number;
  startedAt: Date;
  doneAt: Date;
  agGUID: string;
}

@Table({ tableName: 'OrderTransaction', updatedAt: false })
export class OrderTransaction extends Model<
  OrderTransaction,
  IOrderTransactionCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  orderId: number;

  @Column({ type: DataType.DATE, allowNull: false })
  startedAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  doneAt: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  agGUID: string;
}
