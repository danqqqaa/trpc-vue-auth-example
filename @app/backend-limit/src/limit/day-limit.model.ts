import { BelongsTo, Column, DataType, DefaultScope, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { MonthLimit } from './month-limit.model';

export interface IDayLimitCreationAttributes {
    day: number;
    used: number;
    monthId: number;
}

@Table({ tableName: 'DayLimit', timestamps: false })
export class DayLimit extends Model<DayLimit, IDayLimitCreationAttributes> {
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
    day: number;

    @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 0 })
    used: number;

    @ForeignKey(() => MonthLimit)
    @Column({ allowNull: false })
    monthId: number;

    @BelongsTo(() => MonthLimit)
    month: MonthLimit;
}
