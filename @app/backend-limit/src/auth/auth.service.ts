import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain } from 'class-transformer';
import { CustomerService } from 'src/customer/customer.service';
import { ROLE } from 'src/user/user.model';
import { UserService } from 'src/user/user.service';
import { UserCredentialsDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
  ) {}

  async login(userCredentialsDto: UserCredentialsDto) {
    try {
      const user = await this.userService.findOneBylogin(
        userCredentialsDto.login,
      );
      user.verifyPassword(userCredentialsDto.password);
      const { password, ...payload } = user['dataValues'];
      const token = await this.jwtService.signAsync(payload);
      return {
        payload,
        token,
      };
    } catch (error) {
      const customer = await this.customerService.findOneByPhoneNumber(
        userCredentialsDto.login,
      );
      if (!customer) throw error;
      customer.verifyPassword(userCredentialsDto.password);
      await customer.update({
        fcmToken: userCredentialsDto.fcmToken,
        version: userCredentialsDto.version,
      });
      const { password, ...payload } = customer['dataValues'];
      const token = await this.jwtService.signAsync(payload);
      return {
        payload,
        token,
      };
    }
  }

  async resetFcmAndVersion(id: number) {
    const customer = await this.customerService.findOne(id);
    await customer.update({
      fcmToken: null,
      version: null,
    });
  }

  async changePassword(id: number, password: string, role: ROLE) {
    if (role) {
      const user = await this.userService.findOne(id);
      return await user.update({
        password,
        isDefaultPassword: false,
      });
    }
    const customer = await this.customerService.findOne(id);
    return await customer.update({
      password,
      isDefaultPassword: false,
    });
  }

  async resetCustomerPassword(id: number) {
    const customer = await this.customerService.findOne(id);
    return await customer.update({
      password: '123456789',
      isDefaultPassword: true,
    });
  }

  async resetUserPassword(id: number) {
    const user = await this.userService.findOne(id);
    return await user.update({
      password: '123456789',
      isDefaultPassword: true,
    });
  }
}
