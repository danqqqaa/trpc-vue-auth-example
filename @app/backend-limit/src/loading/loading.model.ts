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
  BelongsToMany
} from 'sequelize-typescript';
import { hashSync, compareSync } from 'bcryptjs';
import { ForbiddenException } from '@nestjs/common';
import { Management } from 'src/management/management.model';
import { TransportType } from 'src/recommendation/models/transport-type.model';
import { TransportTypeLoadingAssociation } from './transport-type-loading.association';

export interface ILoadingCreationAttributes {
  name: string;
  phoneNumber: Date;
  subdivision: Date;
  mvz: Date;
}

@Table({ tableName: 'Loading', updatedAt: false })
export class Loading extends Model<Loading, ILoadingCreationAttributes> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.TIME })
  startTimeWork: Date;

  @Column({ type: DataType.TIME })
  endTimeWork: Date;

  @Column({ type: DataType.TIME })
  startTimeLunch: Date;

  @Column({ type: DataType.TIME })
  endTimeLunch: Date;

  @BelongsToMany(() => TransportType, () => TransportTypeLoadingAssociation)
  transportTypes: TransportType[];
}
