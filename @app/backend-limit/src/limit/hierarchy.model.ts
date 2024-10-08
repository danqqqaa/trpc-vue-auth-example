import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasMany,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { AppGateway } from 'src/app.gateway';
import { Customer } from 'src/customer/customer.model';
import { Management } from 'src/management/management.model';
import { LimitRequest } from './limit-request.model';

export interface IHierarchyCreationAttributes {
  ownerId: number;
  bossId: number;
  managementId: number;
  dayLimitUsed: number;
  monthPlanLimit: number;
  monthUsed: number;
  monthFactLimit: number;
  isSubdivision: boolean;
  subdivision: string;
}

@Table({ tableName: 'Hierarchy', timestamps: false })
export class Hierarchy extends Model<Hierarchy, IHierarchyCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ForeignKey(() => Customer)
  @Column
  ownerId: number;

  @BelongsTo(() => Customer)
  owner: Customer;

  @ForeignKey(() => Customer)
  @Column
  bossId: number;

  @BelongsTo(() => Customer)
  boss: Customer;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isSubdivision: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  subdivision: string;

  @ForeignKey(() => Management)
  @Column({ allowNull: false })
  managementId: number;

  @BelongsTo(() => Management)
  management: Management;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  dayLimitUsed: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  monthUsed: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  monthPlanLimit: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
  monthFactLimit: number;

  static async spend(id: number, amount: number) {
    const h = await this.findOne({ where: { ownerId: id } });
    if (h) {
      await h.increment({ dayLimitUsed: amount, monthUsed: amount });
      AppGateway.instance.hierarchyUpdate(h);
      if (h.bossId) {
        await this.spend(h.bossId, amount);
      }
    }
  }

  @HasMany(() => LimitRequest)
  requests: LimitRequest[];
}
