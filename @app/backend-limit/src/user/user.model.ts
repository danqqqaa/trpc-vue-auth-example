import {
  BeforeCreate,
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  Sequelize,
  Table,
} from 'sequelize-typescript';
import { hashSync, compareSync } from 'bcryptjs';
import { ForbiddenException } from '@nestjs/common';
import { Transport } from '../transport/transport.model';
import { Exclude } from 'class-transformer';

export interface IUserCreationAttributes {
  name: string;
  surname: string;
  middlename: string;
  login: string;
  password: string;
  role: ROLE;
  phoneNumber: string;
  workingPhoneNumber?: string;
  isOnDriverShift?: boolean;
  isOnLunch: boolean;
  onLunchSince: Date;
}

export enum ROLE {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  DRIVER = 'DRIVER',
  WATCHER = 'WATCHER',
  WATCHER_WITH_REPORTS = 'WATCHER_WITH_REPORTS',
}

@Table({ tableName: 'User', updatedAt: false })
export class User extends Model<User, IUserCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  surname: string;

  @Column({ type: DataType.STRING, allowNull: false })
  middlename: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  login: string;

  @Exclude()
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @Column({ type: DataType.ENUM(...Object.keys(ROLE)), allowNull: false })
  role: ROLE;

  @Column({ type: DataType.STRING, allowNull: false })
  phoneNumber: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  workingPhoneNumber: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  isDefaultPassword: boolean;

  @HasOne(() => Transport)
  transport?: Transport;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isOnDriverShift: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  fcmToken: string;

  @Column({ type: DataType.STRING, allowNull: true })
  version: string;

  @BeforeCreate
  static beforeCreateHook(user: User) {
    user.password = hashSync(user.password);
  }

  @BeforeValidate
  static beforeValidateHook(user: User) {
    if (!user['dataValues'].password)
      user['dataValues'].password = hashSync('123456789');
    if (!user['dataValues'].workingPhoneNumber)
      user['dataValues'].workingPhoneNumber = user['dataValues'].phoneNumber;
  }

  @BeforeUpdate
  static beforeUpdateHook(user: User) {
    user['dataValues'].password = hashSync(user['dataValues'].password);
  }

  verifyPassword(password: string): boolean {
    if (!compareSync(password, this.password))
      throw new ForbiddenException('Проверьте введеный пароль!');
    return true;
  }
  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isOnLunch: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  onLunchSince: Date;
}
