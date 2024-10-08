import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  Scopes,
  Table,
} from 'sequelize-typescript';

import { User } from './user.model';
import { Transport } from '../transport/transport.model';
import { OrderStats } from '../order/models/order-stats.model';
import { Order } from '../order/models/order.model';
import getPathLength from 'src/common/utils/getPathLength';

export interface IShiftCreationAttributes {
  isCurrent: boolean;
  driverId: number;
  transportId: number;
  startShift: Date;
  endShift: Date;
  orderQuantity: number;
  routeLength: number;
  withoutRouteLength: number;
  tempCoordinatesHistory: string[];
  summaryTimeBeforeAccepted: number;
  summaryTimeEntryToCustomer: number;
  summaryLoadingTime: number;
  summaryDriveTime: number;
  summaryUnloadingTime: number;
}

@DefaultScope(() => ({
  attributes: { exclude: ['tempCoordinatesHistory'] },
}))
@Scopes(() => ({
  full: {},
}))
@Table({ tableName: 'Shift', updatedAt: false })
export class Shift extends Model<Shift, IShiftCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isCurrent: boolean;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  driverId: number;

  @BelongsTo(() => User)
  driver: User;

  @ForeignKey(() => Transport)
  @Column({ allowNull: false })
  transportId: number;

  @BelongsTo(() => Transport)
  transport: Transport;

  @Column({ type: DataType.DATE, allowNull: true })
  startShift: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  endShift: Date;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  orderQuantity: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  routeLength: number;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  withoutRouteLength: number;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
    defaultValue: () => [],
  })
  tempCoordinatesHistory: string[];

  @Column({ type: DataType.BIGINT, allowNull: true, defaultValue: 0 })
  summaryTimeBeforeAccepted: number;

  @Column({ type: DataType.BIGINT, allowNull: true, defaultValue: 0 })
  summaryTimeEntryToCustomer: number;

  @Column({ type: DataType.BIGINT, allowNull: true, defaultValue: 0 })
  summaryLoadingTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true, defaultValue: 0 })
  summaryDriveTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true, defaultValue: 0 })
  summaryUnloadingTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true, defaultValue: 0 })
  summaryLoadingWaitingTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true, defaultValue: 0 })
  summaryAfterLoadingWaitingTime: number;

  @Column({ type: DataType.BIGINT, allowNull: true, defaultValue: 0 })
  summaryUnloadingWaiting: number;

  @Column({ type: DataType.VIRTUAL })
  get freeTime(): number | null {
    const startShift = this.getDataValue('startShift');
    const endShift = this.getDataValue('endShift');
    if (!startShift || !endShift) return null;
    return (
      (new Date(endShift) as any) -
      (new Date(startShift) as any) -
      (
        // Number(this.getDataValue('summaryTimeBeforeAccepted')) +
        Number(this.getDataValue('summaryTimeEntryToCustomer')) +
        Number(this.getDataValue('summaryLoadingTime')) +
        Number(this.getDataValue('summaryDriveTime')) +
        Number(this.getDataValue('summaryUnloadingTime')) +
        Number(this.getDataValue('summaryLoadingWaitingTime')) +
        Number(this.getDataValue('summaryAfterLoadingWaitingTime')) +
        Number(this.getDataValue('summaryUnloadingWaiting')))
    );
  }

  @Column({ type: DataType.VIRTUAL })
  get summaryAll(): number {
    return (
      // Number(this.getDataValue('summaryTimeBeforeAccepted')) +
      Number(this.getDataValue('summaryTimeEntryToCustomer')) +
      Number(this.getDataValue('summaryLoadingTime')) +
      Number(this.getDataValue('summaryDriveTime')) +
      Number(this.getDataValue('summaryUnloadingTime')) +
      Number(this.getDataValue('summaryLoadingWaitingTime')) +
      Number(this.getDataValue('summaryAfterLoadingWaitingTime')) +
      Number(this.getDataValue('summaryUnloadingWaiting'))
    );
  }

  async addFromStats(stats: OrderStats, order: Order): Promise<void> {
    await this.increment({
      summaryTimeBeforeAccepted: stats.timeBeforeAccepted,
      summaryTimeEntryToCustomer: stats.timeEntryToCustomer,
      summaryLoadingTime: stats.loadingTime,
      summaryDriveTime: stats.driveTime,
      summaryUnloadingTime: stats.unloadingTime,

      summaryLoadingWaitingTime: stats.loadingWaitingTime,
      summaryAfterLoadingWaitingTime: stats.afterLoadingWaitingTime,
      summaryUnloadingWaiting: stats.unloadingWaiting,

      routeLength: order.routeLength,
      orderQuantity: 1,
      withoutRouteLength: this.calculateWithoutRouteLength(),
    });
    await this.update({
      tempCoordinatesHistory: [],
    });
  }

  private calculateWithoutRouteLength(): number {
    return getPathLength(this.tempCoordinatesHistory);
  }

  async end() {
    await this.increment({
      withoutRouteLength: this.calculateWithoutRouteLength(),
    });
    await this.update({
      tempCoordinatesHistory: [],
      isCurrent: false,
      endShift: new Date(),
    });
  }
}
