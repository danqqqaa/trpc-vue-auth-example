import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { TransportType } from './transport-type.model';
import { CargoTypeTransportTypeAssociation } from './cargo-type-transport-type.association';

export interface ICargoTypeCreationAttributes {
  description: string;
  priority: number;
  isRequest: boolean;
  withEmergency: boolean;
}

@Table({ tableName: 'CargoType', updatedAt: false })
export class CargoType extends Model<CargoType, ICargoTypeCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  priority: number;

  @BelongsToMany(() => TransportType, () => CargoTypeTransportTypeAssociation)
  transportTypes: TransportType[];

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isRequest: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  withEmergency: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  ignoreInRecommendation: boolean;

  // ALTER TABLE IF EXISTS public."CargoType"
  //   ADD COLUMN "ignoreInRecommendation" boolean NOT NULL DEFAULT False;
}
