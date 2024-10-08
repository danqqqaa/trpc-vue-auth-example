import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './user.model';
import { Transport } from 'src/transport/transport.model';
import { TransportModule } from 'src/transport/transport.module';
import { CustomerModule } from 'src/customer/customer.module';
import { Shift } from './shift.model';
import { OperatorShift } from './operator-shift.model';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [
    SequelizeModule.forFeature(
      [User, Transport, Shift, OperatorShift],
      'GAZELLE_REPOSITORY',
    ),
    TransportModule,
    CustomerModule,
  ],
  exports: [UserService],
})
export class UserModule {}
