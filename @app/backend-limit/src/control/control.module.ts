import { Module, forwardRef } from '@nestjs/common';
import { ControlService } from './control.service';
import { ControlController } from './control.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Control } from './control.model';
import { LimitModule } from 'src/limit/limit.module';
import { ManagementModule } from 'src/management/management.module';
import { MonthLimit } from 'src/limit/month-limit.model';

@Module({
  controllers: [ControlController],
  providers: [ControlService],
  imports:
    [SequelizeModule.forFeature(
      [Control, MonthLimit],
      'GAZELLE_REPOSITORY',
    ),
    forwardRef(() => LimitModule),
    ManagementModule
  ],
  exports: [ControlService]
})
export class ControlModule {}
