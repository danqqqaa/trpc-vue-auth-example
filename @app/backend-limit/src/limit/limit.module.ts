import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from 'src/customer/customer.model';
import { ManagementModule } from 'src/management/management.module';
import { OrderStats } from 'src/order/models/order-stats.model';
import { Place } from 'src/place/place.model';
import { DayLimit } from './day-limit.model';
import { Hierarchy } from './hierarchy.model';
import { LimitRequest } from './limit-request.model';
import { LimitService } from './limit.service';
import { MonthLimit } from './month-limit.model';

@Module({
    providers: [LimitService],
    imports: [
        SequelizeModule.forFeature(
            [DayLimit, MonthLimit, OrderStats, Hierarchy, LimitRequest, Place, Customer],
            'GAZELLE_REPOSITORY',
        ),
        forwardRef(() => ManagementModule),  
    ],
    exports: [LimitService]
})
export class LimitModule { }
