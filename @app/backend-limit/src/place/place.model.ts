import { Column, DataType, Model, Table, BelongsToMany, ForeignKey } from 'sequelize-typescript';
import { TransportType } from 'src/recommendation/models/transport-type.model';
import { TransportTypePlaceAssociation } from './transport-type-place.association';
import { Management } from 'src/management/management.model';

export interface IPlaceCreationAttributes {
  name: string;
  latitude?: number;
  longitude?: number;
  addedManualy?: boolean,
  norm: number;
}

@Table({ tableName: 'Place', updatedAt: false })
export class Place extends Model<Place, IPlaceCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 15 })
  norm: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  latitude?: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  longitude?: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDeleted: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  addedManualy: boolean;

  @Column({ type: DataType.TIME })
  startTimeWork: Date;

  @Column({ type: DataType.TIME })
  endTimeWork: Date;

  @Column({ type: DataType.TIME })
  startTimeLunch: Date;

  @Column({ type: DataType.TIME })
  endTimeLunch: Date;

  @ForeignKey(() => Management)
  @Column({ type: DataType.INTEGER })
  manageId: number

  @BelongsToMany(() => TransportType, () => TransportTypePlaceAssociation)
  transportTypes: TransportType[];
}


