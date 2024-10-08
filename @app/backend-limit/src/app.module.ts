import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { CustomerModule } from './customer/customer.module';
import { ContactModule } from './contact/contact.module';
import { PlaceModule } from './place/place.module';
import { OrderModule } from './order/order.module';
import { TransportModule } from './transport/transport.module';
import { StatusModule } from './status/status.module';
import { UserModule } from './user/user.module';
import { Contact } from './contact/contact.model';
import { Customer } from './customer/customer.model';
import { Order } from './order/models/order.model';
import { Place } from './place/place.model';
import { Status } from './status/status.model';
import { Transport } from './transport/transport.model';
import { User } from './user/user.model';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './common/guards';
import { AppGateway } from './app.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { OrderStats } from './order/models/order-stats.model';
import { Shift } from './user/shift.model';
import { OperatorShift } from './user/operator-shift.model';
import { ManagementModule } from './management/management.module';
import { LimitModule } from './limit/limit.module';
import { Management } from './management/management.model';
import { DayLimit } from './limit/day-limit.model';
import { MonthLimit } from './limit/month-limit.model';
import { Hierarchy } from './limit/hierarchy.model';
import { LimitRequest } from './limit/limit-request.model';
import { Route } from './order/models/route.model';
import { OrderTransaction } from './order/models/order-transaction.model';
import { StatusScenario } from './status/status-scenario.model';
import { NotificationModule } from './notification/notification.module';
import { ControlModule } from './control/control.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { CargoTypeTransportTypeAssociation } from './recommendation/models/cargo-type-transport-type.association';
import { CargoType } from './recommendation/models/cargo-type.model';
import { TransportType } from './recommendation/models/transport-type.model';
import { Config } from './recommendation/models/config.model';
import { TransportTypeLoadingAssociation } from './loading/transport-type-loading.association';
import { Loading } from './loading/loading.model';
import { LoadingModule } from './loading/loading.module';
import { TransportTypePlaceAssociation } from './place/transport-type-place.association';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      name: 'GAZELLE_REPOSITORY',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = {
          dialect: configService.get<Dialect>('SERVICE_DB_DIALECT'),
          host: configService.get<string>('SERVICE_DB_HOST'),
          port: configService.get<number>('SERVICE_DB_PORT'),
          username: configService.get<string>('SERVICE_DB_USER'),
          password: configService.get<string>('SERVICE_DB_PASSWORD'),
          database: configService.get<string>('SERVICE_DB_NAME'),
        };
        return {
          ...config,
          models: [
            Contact,
            Customer,
            Order,
            Place,
            Status,
            Transport,
            User,
            OrderStats,
            Shift,
            OperatorShift,
            DayLimit,
            MonthLimit,
            Management,
            Hierarchy,
            LimitRequest,
            Route,
            OrderTransaction,
            StatusScenario,
            CargoType,
            TransportType,
            CargoTypeTransportTypeAssociation,
            Loading,
            TransportTypeLoadingAssociation,
            TransportTypePlaceAssociation,
            Config
          ],
          autoLoadModels: true,
          logging: false,
          sync: {
            force: configService.get<string>('RESET_DB') === 'true',
          },
        };
      },
    }),
    AuthModule,
    ContactModule,
    CustomerModule,
    OrderModule,
    PlaceModule,
    StatusModule,
    TransportModule,
    LoadingModule,
    UserModule,
    ScheduleModule.forRoot(),
    ManagementModule,
    LimitModule,
    NotificationModule,
    ControlModule,
    RecommendationModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    AppGateway,
  ],
})
export class AppModule {}
