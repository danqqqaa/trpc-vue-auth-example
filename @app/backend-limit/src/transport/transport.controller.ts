import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateTransportDto } from './dto/create-transport.dto';
import { UpdateTransportDto } from './dto/update-transport.dto';
import { CurrentUser, Public } from 'src/common/decorators';

@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) { }

  @Get()
  findAll() {
    return this.transportService.findAll();
  }

  @Get('free')
  findFree(@CurrentUser() user: any) {
    return this.transportService.findFree(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.findOne(id);
  }

  @Post()
  create(@Body() createTransportDto: CreateTransportDto) {
    return this.transportService.create(createTransportDto);
  }

  @Public()
  @Post('set-position/:id')
  setPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() { latitude, longitude }: any,
  ) {
    console.log(id, latitude, longitude);
    return this.transportService.setPosition(id, latitude, longitude);
  }

  @Post('set-position-by-token')
  setPositionByToken(
    @CurrentUser() user: any,
    @Body() { lat, lon }: any,
  ) {
    return this.transportService.setPositionByUserId(user.id, lat, lon);
  }

  @Public()
  @Post('clear-position/:id')
  clearPosition(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.clearPosition(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransportDto: UpdateTransportDto,
  ) {
    return this.transportService.update(id, updateTransportDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.transportService.delete(id);
  }
}
