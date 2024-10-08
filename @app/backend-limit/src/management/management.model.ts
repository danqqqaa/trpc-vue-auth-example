import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  Scopes,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { Customer } from 'src/customer/customer.model';
import { MonthLimit } from 'src/limit/month-limit.model';
import * as moment from 'moment';
export interface IManagementCreationAttributes {
  name: string;
  isMinutes: boolean;
  bossId: number;
  defaultLimit: number;
  defaultPercentage: number;
  operatingSpeedVariable: number;
  isSubdivision: boolean;
  subdivision: string;
}

@DefaultScope(() => ({
  include: [
    {
      model: MonthLimit,
      where: {
        month: moment().month(),
        year: moment().year(),
      },
      required: false,
    },
  ],
}))
@Table({ tableName: 'Management', timestamps: false })
export class Management extends Model<
  Management,
  IManagementCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isMinutes: boolean;

  @Column({ type: DataType.FLOAT, allowNull: false })
  defaultLimit: number;

  @Column({ type: DataType.FLOAT })
  defaultPercentage: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  operatingSpeedVariable: number;

  @ForeignKey(() => Customer)
  @Column
  bossId: number;

  @BelongsTo(() => Customer)
  boss: Customer;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isSubdivision: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  subdivision: string;

  @HasMany(() => MonthLimit)
  limits: MonthLimit[];
}
