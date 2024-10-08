import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface IConfigCreationAttributes {
  autoTransport: boolean;
}

@Table({ tableName: 'Config', updatedAt: false })
export class Config extends Model<Config, IConfigCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  autoTransport: boolean;
}
