import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { TransportType } from 'src/recommendation/models/transport-type.model';
import { Loading } from './loading.model';
;

export interface ITransportTypeLoadingAssociationCreationAttributes {
  loadingId: number;
  transportTypeId: number;
}

@Table({ tableName: 'TransportTypeLoadingAssociation', updatedAt: false })
export class TransportTypeLoadingAssociation extends Model<
  TransportTypeLoadingAssociation,
  ITransportTypeLoadingAssociationCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Loading)
  @Column
  loadingId: number;

  @ForeignKey(() => TransportType)
  @Column
  transportTypeId: number;
}
