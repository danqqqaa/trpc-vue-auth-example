import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

import { User } from './user.model';
import { Transport } from '../transport/transport.model';

export interface IOperatorShiftCreationAttributes {
  operatorFullname: string;
  transportId: number;
  orderQuantity: number;
  summaryBusyTime: number;
  summaryNotBusyTime: number;
  date: Date;
}

@Table({ tableName: 'OperatorShift', updatedAt: false })
export class OperatorShift extends Model<
  OperatorShift,
  IOperatorShiftCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  operatorFullname: string;

  @ForeignKey(() => Transport)
  @Column({ allowNull: false })
  transportId: number;

  @BelongsTo(() => Transport)
  transport: Transport;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  orderQuantity: number;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  summaryBusyTime: number;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  summaryNotBusyTime: number;

  @Column({ type: DataType.DATEONLY, allowNull: false, defaultValue: Date.now })
  date: Date;
}
