import { BelongsTo, Column, DataType, DefaultScope, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import * as moment from 'moment';


export interface IControlCreationAttributes {
    year: number;
    month: number;
    productionPlanVolume: number;
    productionFactVolume: number;
    realizationByHours: number;
    discount: number;
    fixedCost: number;
    veriableCost: number;
}

@Table({ tableName: 'Control', timestamps: false })
export class Control extends Model<Control, IControlCreationAttributes> {
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

    @Column({
        type: DataType.FLOAT,
    })
    productionPlanVolume: number;

    @Column({ type: DataType.FLOAT })
    productionFactVolume: number;

    @Column({ type: DataType.FLOAT })
    realizationByHours: number;

    @Column({ type: DataType.FLOAT })
    discount: number;

    @Column({ type: DataType.INTEGER })
    fixedCost: number;

    @Column({ type: DataType.INTEGER })
    veriableCost: number;
}
