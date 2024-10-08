import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators';
import { LimitService } from 'src/limit/limit.service';
import { ChangeLimitRequestStatusDto } from './dto/change-limit-request-status.dto';
import { CreateHierarchyBindingDto } from './dto/create-hierarchy-binding.dto';
import { CreateLimitRequestDto } from './dto/create-limit-request.dto';
import { CreateManagementDto } from './dto/create-management.dto';
import { UpdateManagementDto } from './dto/update-management.dto';

import { ManagementService } from './management.service';

@Controller('management')
export class ManagementController {
  constructor(
    private readonly managementService: ManagementService,
    private readonly limitService: LimitService,
  ) {}



  @Get('my')
  findMyManagement(@CurrentUser() { id }: { id: number }) {
    return this.managementService.findMyManagement(id);
  }

  @Get('limit-request/:id')
  getBossLimitRequests(@Param('id', ParseIntPipe) managementId: number) {
    return this.limitService.findLimits(managementId);
  }

  @Get('hierarchy')
  findMyHierarchy(@CurrentUser() { id }: { id: number }) {
    return this.managementService.findMyHierarchy(id);
  }

  @Post('hierarchy')
  addToMyHierarchy(
    @CurrentUser() { id }: { id: number },
    @Body() createHierarchyBindingDto: CreateHierarchyBindingDto,
  ) {
    return this.managementService.addToMyHierarchy(
      id,
      createHierarchyBindingDto,
    );
  }

  @Patch('hierarchy')
  updateHierarchy(
    @CurrentUser() { id }: { id: number },
    @Body() createHierarchyBindingDto: CreateHierarchyBindingDto,
  ) {
    return this.managementService.updateHierarchy(
      id,
      createHierarchyBindingDto,
    );
  }

  @Post('limit-request')
  addLimitRequest(
    @CurrentUser() { id }: { id: number },
    @Body() createLimitRequestDto: CreateLimitRequestDto,
  ) {
    return this.managementService.addLimitRequest(id, createLimitRequestDto);
  }

  @Patch('limit-request/:id')
  changeLimitRequestStatus(
    @CurrentUser() { id }: { id: number },
    @Body() changeLimitRequestStatusDto: ChangeLimitRequestStatusDto,
    @Param('id', ParseIntPipe) limitRequestId: number,
  ) {
    return this.limitService.changeLimitRequestStatus(
      changeLimitRequestStatusDto,
      limitRequestId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.findOne(id);
  }

  @Post()
  create(@Body() createManagementDto: CreateManagementDto) {
    return this.managementService.create(createManagementDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateManagementDto: UpdateManagementDto,
  ) {
    return this.managementService.update(id, updateManagementDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.delete(id);
  }

  @Get('/:year/:month')
  findAll(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe) month: number) {
    return this.managementService.findAll(year, month);
  }

  @Get('driving/:year/:month')
  findAllWhileDriving(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe) month: number) {
    return this.managementService.findAllWhileDriving(year, month);
  }

  @Get('reserve/:year/:month')
  findReserve(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe) month: number) {
    return this.managementService.findReserve(year, month);
  }
}
