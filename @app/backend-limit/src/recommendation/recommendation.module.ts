import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { CargoType } from './models/cargo-type.model';
import { TransportType } from './models/transport-type.model';
import { CargoTypeTransportTypeAssociation } from './models/cargo-type-transport-type.association';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { Config } from './models/config.model';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
  imports: [
    SequelizeModule.forFeature(
      [CargoType, TransportType, CargoTypeTransportTypeAssociation, Config],
      'GAZELLE_REPOSITORY',
    ),
    ConfigModule,
  ],
})
export class RecommendationModule {}
