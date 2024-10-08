import { forwardRef, Module } from '@nestjs/common';
import { ManagementService } from './management.service';
import { ManagementController } from './management.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Management } from './management.model';
import { CustomerModule } from 'src/customer/customer.module';
import { LimitModule } from 'src/limit/limit.module';
import { Order } from 'src/order/models/order.model';
import { Control } from 'src/control/control.model';
import { MonthLimit } from 'src/limit/month-limit.model';
import { LimitRequest } from 'src/limit/limit-request.model';

@Module({
  controllers: [ManagementController],
  providers: [ManagementService],
  imports:
    [SequelizeModule.forFeature(
      [Management, Order, Control, MonthLimit, LimitRequest],
      'GAZELLE_REPOSITORY',
    ),
      forwardRef(() => CustomerModule),
      // CustomerModule,
      LimitModule
    ],
  exports: [ManagementService]
})
export class ManagementModule { }
