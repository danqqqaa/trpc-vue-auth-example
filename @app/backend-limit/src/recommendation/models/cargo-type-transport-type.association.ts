import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TransportType } from './transport-type.model';
import { CargoType } from './cargo-type.model';

export interface ICargoTypeTransportTypeAssociationCreationAttributes {
  cargoTypeId: number;
  transportTypeId: number;
  transportPriorityForCargo: number;
}

@Table({ tableName: 'CargoTypeTransportTypeAssociation', updatedAt: false })
export class CargoTypeTransportTypeAssociation extends Model<
  CargoTypeTransportTypeAssociation,
  ICargoTypeTransportTypeAssociationCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => CargoType)
  @Column
  cargoTypeId: number;

  @ForeignKey(() => TransportType)
  @Column
  transportTypeId: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  transportPriorityForCargo: number;
}
