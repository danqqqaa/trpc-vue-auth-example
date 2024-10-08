import { forwardRef, Module } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Customer } from './customer.model';
import { Hierarchy } from 'src/limit/hierarchy.model';
import { Management } from 'src/management/management.model';
import { LimitModule } from 'src/limit/limit.module';
import { ManagementModule } from 'src/management/management.module';

@Module({
  controllers: [CustomerController],
  providers: [CustomerService],
  imports: [SequelizeModule.forFeature([Customer, Hierarchy, Management], 'GAZELLE_REPOSITORY'), ManagementModule],
  exports: [CustomerService],
})
export class CustomerModule {}
