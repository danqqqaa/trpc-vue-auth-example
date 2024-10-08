import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface IStatusScenarioCreationAttributes {
  scenario: number;
  code: string;
  codeNext: string;
}

@Table({ tableName: 'StatusScenario', updatedAt: false })
export class StatusScenario extends Model<
  StatusScenario,
  IStatusScenarioCreationAttributes
> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  scenario: number;

  @Column({ type: DataType.STRING, allowNull: false })
  code: string;

  @Column({ type: DataType.STRING, allowNull: true })
  codeNext: string;
}
