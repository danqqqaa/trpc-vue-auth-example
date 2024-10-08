import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CargoType } from './models/cargo-type.model';
import { TransportType } from './models/transport-type.model';
import { CargoTypeTransportTypeAssociation } from './models/cargo-type-transport-type.association';
import { CreateCargoTypeDto } from './dto/create-cargo-type.dto';
import { CreateTransportTypeDto } from './dto/create-transport-type.dto';
import { UpdateCargoTypeDto } from './dto/update-cargo-type.dto';
import { UpdateTransportTypeDto } from './dto/update-transport-type.dto';
import sequelize from 'sequelize';
import { Config } from './models/config.model';
import { UpdateConfigDto } from './dto/update-config.dto';
import { AppGateway } from 'src/app.gateway';

@Injectable()
export class RecommendationService implements OnModuleInit {
  constructor(
    @InjectModel(Config, 'GAZELLE_REPOSITORY')
    private readonly configRepository: typeof Config,
    @InjectModel(CargoType, 'GAZELLE_REPOSITORY')
    private readonly cargoTypeRepository: typeof CargoType,
    @InjectModel(TransportType, 'GAZELLE_REPOSITORY')
    private readonly transportTypeRepository: typeof TransportType,
    @InjectModel(CargoTypeTransportTypeAssociation, 'GAZELLE_REPOSITORY')
    private readonly cargoTypeTransportTypeAssociationRepository: typeof CargoTypeTransportTypeAssociation,
  ) {}

  async onModuleInit() {
    const config = await this.configRepository.findOne({ where: { id: 1 } });
    if (!config) {
      await this.configRepository.create({});
    }
  }

  public async getConfig() {
    return await this.configRepository.findOne({
      where: { id: 1 },
    });
  }

  public async updateConfig(updateConfigDto: UpdateConfigDto) {
    const config = await this.getConfig();
    await config.update(updateConfigDto);
    AppGateway.instance.configChanged(config);
  }

  public getCargoTypes() {
    return this.cargoTypeRepository.findAll({
      order: [['description', 'asc']],
    });
  }

  public createCargoType(createCargoTypeDto: CreateCargoTypeDto) {
    return this.cargoTypeRepository.create(createCargoTypeDto);
  }

  public async updateCargoType(
    cargoTypeId: number,
    updateCargoTypeDto: UpdateCargoTypeDto,
  ) {
    const cargoType = await this.cargoTypeRepository.findOne({
      where: { id: cargoTypeId },
    });
    return cargoType.update(updateCargoTypeDto);
  }

  public deleteCargoType(cargoTypeId: number) {
    return this.cargoTypeRepository.destroy({
      where: { id: cargoTypeId },
    });
  }

  public getTransportTypes() {
    return this.transportTypeRepository.findAll({
      order: [['description', 'asc']],
    });
  }

  public createTransportType(createTransportTypeDto: CreateTransportTypeDto) {
    return this.transportTypeRepository.create(createTransportTypeDto);
  }

  public async updateTransportType(
    transportTypeId: number,
    updateTransportTypeDto: UpdateTransportTypeDto,
  ) {
    const transportType = await this.transportTypeRepository.findOne({
      where: { id: transportTypeId },
    });
    return transportType.update(updateTransportTypeDto);
  }

  public deleteTransportType(transportTypeId: number) {
    return this.transportTypeRepository.destroy({
      where: { id: transportTypeId },
    });
  }

  public getRelatedTransportTypesByCargoTypeId(cargoTypeId: number) {
    return this.cargoTypeRepository.findOne({
      where: { id: cargoTypeId },
      include: [
        {
          model: TransportType,
        },
      ],
      order: [
        [
          sequelize.col(
            'transportTypes.CargoTypeTransportTypeAssociation.transportPriorityForCargo',
          ),
          'desc',
        ],
      ],
    });
  }

  public getRelatedCargoTypesByTransportTypeId(transportTypeId: number) {
    return this.transportTypeRepository.findOne({
      where: { id: transportTypeId },
      include: [
        {
          model: CargoType,
        },
      ],
      order: [
        [
          sequelize.col(
            'cargoTypes.CargoTypeTransportTypeAssociation.transportPriorityForCargo',
          ),
          'desc',
        ],
      ],
    });
  }

  public boundCargoTypeToTransportType(
    cargoTypeId: number,
    transportTypeId: number,
    priority: number,
  ) {
    return this.cargoTypeTransportTypeAssociationRepository.create({
      cargoTypeId,
      transportTypeId,
      transportPriorityForCargo: priority,
    });
  }

  public unboundCargoTypeToTransportType(
    cargoTypeId: number,
    transportTypeId: number,
  ) {
    return this.cargoTypeTransportTypeAssociationRepository.destroy({
      where: {
        cargoTypeId,
        transportTypeId,
      },
    });
  }
}
