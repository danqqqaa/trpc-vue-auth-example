import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { CreateCargoTypeDto } from './dto/create-cargo-type.dto';
import { CreateTransportTypeDto } from './dto/create-transport-type.dto';
import { UpdateCargoTypeDto } from './dto/update-cargo-type.dto';
import { UpdateTransportTypeDto } from './dto/update-transport-type.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get('config')
  public getConfig() {
    return this.recommendationService.getConfig();
  }

  @Patch('/config')
  public updateConfig(@Body() updateConfigDto: UpdateConfigDto) {
    return this.recommendationService.updateConfig(updateConfigDto);
  }

  @Get('cargo-types')
  public getCargoTypes() {
    return this.recommendationService.getCargoTypes();
  }

  @Post('cargo-types')
  public createCargoType(@Body() createCargoTypeDto: CreateCargoTypeDto) {
    return this.recommendationService.createCargoType(createCargoTypeDto);
  }

  @Patch('cargo-types/:cargoTypeId')
  public updateCargoType(
    @Param('cargoTypeId', ParseIntPipe) cargoTypeId: number,
    @Body() updateCargoTypeDto: UpdateCargoTypeDto,
  ) {
    return this.recommendationService.updateCargoType(
      cargoTypeId,
      updateCargoTypeDto,
    );
  }

  @Delete('cargo-types/:cargoTypeId')
  public deleteCargoType(
    @Param('cargoTypeId', ParseIntPipe) cargoTypeId: number,
  ) {
    return this.recommendationService.deleteCargoType(cargoTypeId);
  }

  @Get('transport-types')
  public getTransportTypes() {
    return this.recommendationService.getTransportTypes();
  }

  @Post('transport-types')
  public createTransportType(
    @Body() createTransportTypeDto: CreateTransportTypeDto,
  ) {
    return this.recommendationService.createTransportType(
      createTransportTypeDto,
    );
  }

  @Patch('transport-types/:transportTypeId')
  public updateTransportType(
    @Param('transportTypeId', ParseIntPipe) transportTypeId: number,
    @Body() updateTransportTypeDto: UpdateTransportTypeDto,
  ) {
    return this.recommendationService.updateTransportType(
      transportTypeId,
      updateTransportTypeDto,
    );
  }

  @Delete('transport-types/:transportTypeId')
  public deleteTransportType(
    @Param('transportTypeId', ParseIntPipe) transportTypeId: number,
  ) {
    return this.recommendationService.deleteTransportType(transportTypeId);
  }

  @Get('related-transport-types/:cargoTypeId')
  public getRelatedTransportTypesByCargoTypeId(
    @Param('cargoTypeId', ParseIntPipe) cargoTypeId: number,
  ) {
    return this.recommendationService.getRelatedTransportTypesByCargoTypeId(
      cargoTypeId,
    );
  }

  @Get('related-cargo-types/:transportTypeId')
  public getRelatedTransportTgetRelatedCargoTypesByTransportTypeIdypesByCargoTypeId(
    @Param('transportTypeId', ParseIntPipe) transportTypeId: number,
  ) {
    return this.recommendationService.getRelatedCargoTypesByTransportTypeId(
      transportTypeId,
    );
  }

  @Post('bound-cargo-type-to-transport-type/:cargoTypeId/:transportTypeId')
  public boundCargoTypeToTransportType(
    @Param('cargoTypeId', ParseIntPipe) cargoTypeId: number,
    @Param('transportTypeId', ParseIntPipe) transportTypeId: number,
    @Body('priority', ParseIntPipe) priority: number,
  ) {
    return this.recommendationService.boundCargoTypeToTransportType(
      cargoTypeId,
      transportTypeId,
      priority,
    );
  }

  @Delete('bound-cargo-type-to-transport-type/:cargoTypeId/:transportTypeId')
  public unboundCargoTypeToTransportType(
    @Param('cargoTypeId', ParseIntPipe) cargoTypeId: number,
    @Param('transportTypeId', ParseIntPipe) transportTypeId: number,
  ) {
    return this.recommendationService.unboundCargoTypeToTransportType(
      cargoTypeId,
      transportTypeId,
    );
  }
}
