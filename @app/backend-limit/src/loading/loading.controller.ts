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
import { LoadingService } from './loading.service';
import { CreateLoadingDto, UpdateLoadingDto } from './dto';

@Controller('loading')
export class LoadingController {
  constructor(private readonly loadingService: LoadingService) {}

  @Get()
  findAll() {
    return this.loadingService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.customerService.findOne(id);
  // }

  @Post()
  create(@Body() createLoadingDto: CreateLoadingDto) {
    return this.loadingService.create(createLoadingDto);
  }

  @Post(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLoadingDto: UpdateLoadingDto,
  ) {
    return this.loadingService.update(id, updateLoadingDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.loadingService.delete(id);
  }
}
