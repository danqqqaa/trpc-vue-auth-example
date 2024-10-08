import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser, Public } from 'src/common/decorators';
import { AuthService } from './auth.service';
import { UserCredentialsDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  login(@Body() userCredentialsDto: UserCredentialsDto) {
    return this.authService.login(userCredentialsDto);
  }

  @Delete()
  resetFcmAndVersion(@CurrentUser() { id }: { id: number }) {
    return this.authService.resetFcmAndVersion(id);
  }

  @Patch('/change-password')
  changePassword(
    @CurrentUser() user: any,
    @Body()
    data: {
      password: string;
    },
  ) {
    return this.authService.changePassword(user.id, data.password, user.role);
  }

  @Patch('/reset-password/customer/:id')
  resetCustomerPassword(@Param('id', ParseIntPipe) id: number) {
    return this.authService.resetCustomerPassword(id);
  }

  @Patch('/reset-password/user/:id')
  resetUserPassword(@Param('id', ParseIntPipe) id: number) {
    return this.authService.resetUserPassword(id);
  }
}

/*
 ALTER TABLE IF EXISTS public."Customer" add COLUMN
"fcmToken" text COLLATE pg_catalog."default";

ALTER TABLE IF EXISTS public."Customer" add COLUMN
version character varying(255) COLLATE pg_catalog."default"; 
*/
