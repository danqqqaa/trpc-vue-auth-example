import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TransportType } from 'src/recommendation/models/transport-type.model';
import { Place } from './place.model';


export interface ITransportTypePlaceAssociationCreationAttributes {
  placeId: number;
  transportTypeId: number;
}

@Table({ tableName: 'TransportTypePlaceAssociation', updatedAt: false })
export class TransportTypePlaceAssociation extends Model<
  TransportTypePlaceAssociation,
  ITransportTypePlaceAssociationCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Place)
  @Column
  placeId: number;

  @ForeignKey(() => TransportType)
  @Column
  transportTypeId: number;
}
