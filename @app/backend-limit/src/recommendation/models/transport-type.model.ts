import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { CargoType } from './cargo-type.model';
import { CargoTypeTransportTypeAssociation } from './cargo-type-transport-type.association';

export interface ITransportTypeCreationAttributes {
  description: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  passengerSeats: number;
}

@Table({ tableName: 'TransportType', updatedAt: false })
export class TransportType extends Model<
  TransportType,
  ITransportTypeCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  weight: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  length: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  width: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  height: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  passengerSeats: number;

  @BelongsToMany(() => CargoType, () => CargoTypeTransportTypeAssociation)
  cargoTypes: CargoType[];
}
