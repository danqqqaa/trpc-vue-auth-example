import { Exclude } from 'class-transformer';
import {
  BeforeCreate,
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { hashSync, compareSync } from 'bcryptjs';
import { ForbiddenException } from '@nestjs/common';
import { Management } from 'src/management/management.model';

export interface ICustomerCreationAttributes {
  fullname: string;
  phoneNumber: string;
  subdivision: string;
  mvz: string;
}

@Table({ tableName: 'Customer', updatedAt: false })
export class Customer extends Model<Customer, ICustomerCreationAttributes> {
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

  @Column({ type: DataType.STRING, allowNull: false })
  subdivision: string;

  @Exclude()
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  fcmToken: string;

  @Column({ type: DataType.STRING, allowNull: true })
  version: string;

  @Column({ type: DataType.STRING, allowNull: true })
  mvz: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  managementId: number;

  @BeforeValidate
  static beforeValidateHook(customer: Customer) {
    if (!customer['dataValues'].password)
      customer['dataValues'].password = hashSync('123456789');
  }

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isDefaultPassword: boolean;

  @BeforeUpdate
  static beforeUpdateHook(customer: Customer) {
    customer['dataValues'].password = hashSync(customer['dataValues'].password);
  }

  verifyPassword(password: string): boolean {
    if (!compareSync(password, this.password))
      throw new ForbiddenException('Проверьте введеный пароль!');
    return true;
  }
}
