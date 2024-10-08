import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface IStatusCreationAttributes {
  description: string;
}

@Table({ tableName: 'Status', updatedAt: false })
export class Status extends Model<Status, IStatusCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  code: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isBusy: boolean;

  @Column({ type: DataType.INTEGER, allowNull: true })
  globalOrder: number;
}
