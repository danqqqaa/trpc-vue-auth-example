import { Module } from '@nestjs/common';
import { StatusService } from './status.service';
import { StatusController } from './status.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Status } from './status.model';

@Module({
  controllers: [StatusController],
  providers: [StatusService],
  imports: [SequelizeModule.forFeature([Status], 'GAZELLE_REPOSITORY')],
  exports: [StatusService],
})
export class StatusModule {}
