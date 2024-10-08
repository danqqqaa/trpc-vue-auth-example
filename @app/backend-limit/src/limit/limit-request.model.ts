import { BelongsTo, Column, DataType, DefaultScope, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { Customer } from 'src/customer/customer.model';
import { Hierarchy } from './hierarchy.model';
import { MonthLimit } from './month-limit.model';

export interface ILimitRequestCreationAttributes {
    amount: number;
    approved: boolean;
    declined: boolean;
    monthId: number;
    ownerId: number;
    hierarchyId: number;
}

@Table({ tableName: 'LimitRequest', timestamps: false })
export class LimitRequest extends Model<LimitRequest, ILimitRequestCreationAttributes> {
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    })
    id: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    amount: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    approved: boolean;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false
    })
    declined: boolean;

    @ForeignKey(() => MonthLimit)
    @Column({ allowNull: false })
    monthId: number;

    @BelongsTo(() => MonthLimit)
    month: MonthLimit;

    @ForeignKey(() => Customer)
    @Column({ allowNull: false })
    ownerId: number;

    @BelongsTo(() => Customer)
    owner: Customer;

    @ForeignKey(() => Hierarchy)
    @Column({ allowNull: false })
    hierarchyId: number;

    @BelongsTo(() => Hierarchy)
    hierarchy: Hierarchy;
}
