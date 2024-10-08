import { forwardRef, Module } from '@nestjs/common';
import { LoadingService } from './loading.service';
import { LoadingController } from './loading.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Loading } from './loading.model';
import { TransportType } from 'src/recommendation/models/transport-type.model';
import { ConfigModule } from '@nestjs/config';
import { TransportTypeLoadingAssociation } from './transport-type-loading.association';

@Module({
  controllers: [LoadingController],
  providers: [LoadingService],
  imports: [SequelizeModule.forFeature([Loading, TransportType, TransportTypeLoadingAssociation], 'GAZELLE_REPOSITORY')],
  exports: [LoadingService],
})
export class LoadingModule {}
