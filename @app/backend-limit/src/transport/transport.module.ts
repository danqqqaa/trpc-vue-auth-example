import { forwardRef, Module } from '@nestjs/common';
import { TransportService } from './transport.service';
import { TransportController } from './transport.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Transport } from './transport.model';
import { StatusModule } from 'src/status/status.module';
import { Status } from 'src/status/status.model';
import { Order } from 'src/order/models/order.model';
import { UserModule } from 'src/user/user.module';
import { OperatorShift } from 'src/user/operator-shift.model';
import { Route } from 'src/order/models/route.model';
import { TransportType } from 'src/recommendation/models/transport-type.model';

@Module({
  controllers: [TransportController],
  providers: [TransportService],
  imports: [
    SequelizeModule.forFeature(
      [Transport, Status, Order, Status, OperatorShift, Route, TransportType],
      'GAZELLE_REPOSITORY',
    ),
    StatusModule,
    forwardRef(() => UserModule),
  ],
  exports: [TransportService],
})
export class TransportModule {}
