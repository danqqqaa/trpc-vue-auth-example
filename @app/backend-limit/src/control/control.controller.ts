import { CreateControlDto } from './control.dto';
import { ControlService } from './control.service';
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

@Controller('control')
export class ControlController {
  constructor(private readonly controlService: ControlService) {
  }
  @Get('/:year/:month')
  getControl(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe) month: number) {
    return this.controlService.getControl(year, month);
  }
  @Get('/')
  getAllControl() {
    return this.controlService.getAllControl();
  }
  @Post('create/:year/:month')
  createControl(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe)  month: number) {
    return this.controlService.createControl(year, month);
  }
  @Post('edit/:year/:month')
  editControl(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe)  month: number, @Body() createControlDto: CreateControlDto) {
    return this.controlService.editControl(year, month, createControlDto);
  }
  @Get('monthlimit/:year/:month')
  getMonthLimit(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe) month: number) {
    return this.controlService.getMonthLimit(year, month);
  }
  @Post('monthlimit/:year/:month')
  editMonthLimit(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe)  month: number, @Body() data) {
    return this.controlService.editMonthLimit(year, month, data);
  }
  @Post('monthlimits/:year/:month')
  editMonthLimits(@Param('year', ParseIntPipe) year: number, @Param('month', ParseIntPipe)  month: number, @Body() data) {
    return this.controlService.editMonthLimits(year, month, data);
  }
}
