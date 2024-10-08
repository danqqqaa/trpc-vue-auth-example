import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Place } from './place.model';
import { ConfigModule } from '@nestjs/config';
import { TransportType } from 'src/recommendation/models/transport-type.model';
import { TransportTypePlaceAssociation } from './transport-type-place.association';

@Module({
  controllers: [PlaceController],
  providers: [PlaceService],
  imports: [
    SequelizeModule.forFeature([Place, TransportType, TransportTypePlaceAssociation], 'GAZELLE_REPOSITORY'),
    ConfigModule,
  ],
  exports: [PlaceService],
})
export class PlaceModule {}
