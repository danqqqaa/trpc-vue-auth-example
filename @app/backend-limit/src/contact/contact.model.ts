import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface IContactCreationAttributes {
  fullname: string;
  phoneNumber: string;
}

@Table({ tableName: 'Contact', updatedAt: false })
export class Contact extends Model<Contact, IContactCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  fullname: string;

  @Column({ type: DataType.STRING, allowNull: false })
  phoneNumber: string;
}
