import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser, Public } from 'src/common/decorators';
import { CustomerService } from 'src/customer/customer.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('drivers')
  findDrivers() {
    return this.userService.findDrivers();
  }

  @Get('non-drivers')
  findNonDrivers() {
    return this.userService.findNonDrivers();
  }

  @Public()
  @Get('operators')
  findOperators() {
    return this.userService.findOperators();
  }

  @Get('current')
  findCurrent(@CurrentUser() user: any) {
    if (!user.role) return this.customerService.findOne(user.id);
    return this.userService.findOne(user.id);
  }

  @Get('stats-dates')
  getStatsDates() {
    return this.userService.getStatsDates();
  }

  @Get('stats')
  getStats(@Query() dates: { from: string; to: string }) {
    return this.userService.getStats(dates);
  }

  @Get('operator/stats-dates')
  getOperatorStatsDates() {
    return this.userService.getOperatorStatsDates();
  }

  @Get('operator/stats')
  getOperatorStats(@Query() dates: { from: string; to: string }) {
    return this.userService.getOperatorStats(dates);
  }

  @Get('/day-driver-shift')
  getDayStats(@Query() dates: { from: string; to: string }) {
    return this.userService.dayDriverShift(dates);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch('/set-phone-and-transport')
  setPhoneAndTransport(
    @CurrentUser() user: any,
    @Body()
    data: {
      workingPhoneNumber: string;
      transportId: number;
      fcmToken: string;
      version: string;
    },
  ) {
    return this.userService.setPhoneNumberAndTransport(user.id, data);
  }

  @Patch('/set-fcm')
  setFcm(
    @CurrentUser() user: any,
    @Body()
    data: {
      fcmToken: string;
    },
  ) {
    return this.userService.setFcm(user.id, data);
  }

  @Patch('/end-driver-shift')
  endDriverShift(@CurrentUser() user: any) {
    return this.userService.endDriverShift(user.id);
  }

  @Patch('/lunch')
  setOnLunch(
    @Body()
    data: {
      lunch: boolean;
    },
    @CurrentUser() user: any,
  ) {
    return this.userService.setOnLunch(data.lunch, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }
}
