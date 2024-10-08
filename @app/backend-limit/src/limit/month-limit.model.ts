import { BelongsTo, Column, DataType, DefaultScope, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { Customer } from 'src/customer/customer.model';
import { Management } from 'src/management/management.model';
import { DayLimit } from './day-limit.model';
import * as moment from 'moment';
import { LimitRequest } from './limit-request.model';

export interface IMonthLimitCreationAttributes {
    year: number;
    month: number;
    plan: number;
    fact: number;
    used: number;
    percentage: number;
    managementId: number;
}

@DefaultScope(() => ({
    include: [
        {
            model: DayLimit,
            where: {
                day: moment().date(),
            },
            required: false,
        }
    ]
}))
@Table({ tableName: 'MonthLimit', timestamps: false })
export class MonthLimit extends Model<MonthLimit, IMonthLimitCreationAttributes> {
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    year: number;

    @Column({ type: DataType.INTEGER, allowNull: false })
    month: number;

    @Column({ type: DataType.FLOAT, allowNull: false })
    plan: number;

    @Column({ type: DataType.FLOAT, allowNull: false })
    fact: number;

    @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
    used: number;

    @Column({ type: DataType.FLOAT })
    percentage: number;

    @Column({ type: DataType.FLOAT, defaultValue: 0 })
    technologicalTransport: number;

    @ForeignKey(() => Management)
    @Column({ allowNull: false })
    managementId: number;

    @BelongsTo(() => Management)
    management: Management;

    @HasMany(() => DayLimit)
    daylimits: DayLimit[];

    @HasMany(() => LimitRequest)
    requests: LimitRequest[];
}
