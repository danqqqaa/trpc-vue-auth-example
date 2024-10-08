import { Module } from '@nestjs/common';
import { OrderService } from './services/order.service';
import { OrderController } from './order.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from './models/order.model';
import { ContactModule } from '../contact/contact.module';
import { CustomerModule } from '../customer/customer.module';
import { UserModule } from 'src/user/user.module';
import { TransportModule } from 'src/transport/transport.module';
import { Place } from 'src/place/place.model';
import { Contact } from 'src/contact/contact.model';
import { Status } from 'src/status/status.model';
import { Transport } from 'src/transport/transport.model';
import { Customer } from 'src/customer/customer.model';
import { PlaceModule } from 'src/place/place.module';
import { OrderStats } from './models/order-stats.model';
import { User } from 'src/user/user.model';
import { StatusModule } from 'src/status/status.module';
import { ManagementModule } from 'src/management/management.module';
import { Route } from './models/route.model';
import { OrderTransaction } from './models/order-transaction.model';
import { StatusScenario } from 'src/status/status-scenario.model';
import { OrderStatusService } from './services/order-status.service';
import { OrderTransactionService } from './services/order-transaction.service';
import { CargoType } from 'src/recommendation/models/cargo-type.model';
import { TransportType } from 'src/recommendation/models/transport-type.model';

@Module({
  controllers: [OrderController],
  providers: [OrderService, OrderStatusService, OrderTransactionService],
  imports: [
    SequelizeModule.forFeature(
      [
        Order,
        Place,
        Contact,
        Status,
        Transport,
        Customer,
        OrderStats,
        User,
        Route,
        OrderTransaction,
        StatusScenario,
        CargoType,
        TransportType,
      ],
      'GAZELLE_REPOSITORY',
    ),
    ContactModule,
    CustomerModule,
    TransportModule,
    PlaceModule,
    StatusModule,
    UserModule,
    ManagementModule,
  ],
  exports: [OrderService, OrderStatusService, OrderTransactionService],
})
export class OrderModule {}
