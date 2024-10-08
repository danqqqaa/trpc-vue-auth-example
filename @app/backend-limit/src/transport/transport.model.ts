import {
  BeforeUpdate,
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';
import { Place } from 'src/place/place.model';
import { TransportType } from 'src/recommendation/models/transport-type.model';
import { Status } from 'src/status/status.model';
import { User } from 'src/user/user.model';

export interface ITransportCreationAttributes {
  type: string;
  transportTypeId: number;
  transportNumber: string;
  latitude?: number;
  longitude?: number;
  statusId: number;
  placeId: number;
  statusChangedAt: Date;
  driverId: number;
  lastCustomerFullame?: string;
  lastCustomerPhoneNumber?: string;
  coordinatesChangedAt: Date;
  lastOperatorFullname: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  isLocal: boolean;
  agGUID: string;
  withDriverSince: Date;
  mvz: string
}

@DefaultScope(() => ({
  include: [
    {
      model: TransportType,
      required: false,
    },
  ],
}))
@Table({ tableName: 'Transport', updatedAt: false })
export class Transport extends Model<Transport, ITransportCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: true })
  type: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  transportNumber: string;

  @Column({ type: DataType.FLOAT, allowNull: true })
  latitude?: number;

  @Column({ type: DataType.FLOAT, allowNull: true })
  longitude?: number;

  @ForeignKey(() => Status)
  @Column
  statusId: number;

  @BelongsTo(() => Status)
  status: Status;

  @ForeignKey(() => Place)
  @Column({ allowNull: true })
  placeId: number;

  @BelongsTo(() => Place)
  place: Place;

  @ForeignKey(() => User)
  @Column({ allowNull: true })
  driverId: number;

  @BelongsTo(() => User)
  driver: User;

  @Column({ type: DataType.DATE, allowNull: false })
  statusChangedAt: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  lastCustomerSubdivision: string;

  @Column({ type: DataType.STRING, allowNull: true })
  lastCustomerPhoneNumber: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isDeleted: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  coordinatesChangedAt: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  lastOperatorFullname: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  weight: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  length: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  width: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  height: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isLocal: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  agGUID: string;

  @Column({ type: DataType.DATE, allowNull: true })
  withDriverSince: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  mvz: string;

  @ForeignKey(() => TransportType)
  @Column({ allowNull: true })
  transportTypeId: number;

  @BelongsTo(() => TransportType)
  transportType: TransportType;

  // ALTER TABLE IF EXISTS public."Transport"
  //   ADD COLUMN "transportTypeId" integer;

  // ALTER TABLE IF EXISTS public."Transport"
  //   ADD CONSTRAINT "Order_transportTypeId_fkey" FOREIGN KEY ("transportTypeId")
  //   REFERENCES public."TransportType" (id) MATCH SIMPLE
  //   ON UPDATE CASCADE
  //   ON DELETE SET NULL;

  @BeforeUpdate
  static beforeUpdateHook(transport: Transport) {
    if (transport['dataValues'].statusId != transport.statusId) {
      transport['dataValues'].statusChangedAt = new Date();
    }
  }
}
