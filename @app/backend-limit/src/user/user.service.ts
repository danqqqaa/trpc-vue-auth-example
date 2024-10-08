import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import sequelize from 'sequelize';
import { Op } from 'sequelize';
import { AppGateway } from 'src/app.gateway';
import { Transport } from 'src/transport/transport.model';
import { TransportService } from 'src/transport/transport.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Shift } from './shift.model';
import { ROLE, User } from './user.model';
import * as moment from 'moment';
import { OperatorShift } from './operator-shift.model';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User, 'GAZELLE_REPOSITORY')
    private readonly userRepository: typeof User,
    @InjectModel(Transport, 'GAZELLE_REPOSITORY')
    private readonly transportRepository: typeof Transport,
    @InjectModel(Shift, 'GAZELLE_REPOSITORY')
    private readonly shiftRepository: typeof Shift,
    @InjectModel(OperatorShift, 'GAZELLE_REPOSITORY')
    private readonly operatorShiftRepository: typeof OperatorShift,
    private readonly transportService: TransportService,
  ) { }

  async onModuleInit() {
    const login = 'test';
    if (!(await this.userRepository.findOne({ where: { login } }))) {
      await this.userRepository.create({
        surname: 'Тестовый',
        name: 'Пользователь',
        middlename: '',
        login,
        password: 'test',
        role: ROLE.ADMIN,
        phoneNumber: '+73159123456',
      });
    }
  }

  async setOnLunch(isLunch: boolean, userId: number) {
    const driver = await this.userRepository.findOne({ where: { id: userId } });
    await driver.update({
      isOnLunch: isLunch,
      onLunchSince: isLunch ? new Date() : null,
    });
    const transport = await this.transportService.findOneByDriverId(driver.id);
    AppGateway.instance.transportUpdate(transport);
    AppGateway.instance.userWithoutMobileUpdate(driver);
    return { lunch: driver.isOnLunch };
  }

  async getStatsDates() {
    return this.shiftRepository.findOne({
      attributes: [
        [sequelize.fn('min', sequelize.col('startShift')), 'min'],
        [sequelize.fn('max', sequelize.col('startShift')), 'max'],
      ],
    });
  }

  async getStats(dates: { from: string; to: string }) {
    return this.shiftRepository.findAll({
      order: [['startShift', 'asc']],
      include: [User, Transport],
      where: {
        startShift: {
          [Op.between]: [
            moment(dates.from, 'DD.MM.YYYY')
              .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
              .toDate(),
            moment(dates.to, 'DD.MM.YYYY').add(1, 'days')
              .set({ hour: 6, minute: 59, second: 59, millisecond: 999 })
              .toDate(),
          ],
        },
      },
    });
  }

  async getOperatorStatsDates() {
    return this.operatorShiftRepository.findOne({
      attributes: [
        [sequelize.fn('min', sequelize.col('createdAt')), 'min'],
        [sequelize.fn('max', sequelize.col('createdAt')), 'max'],
      ],
    });
  }

  async getOperatorStats(dates: { from: string; to: string }) {
    return this.operatorShiftRepository.findAll({
      order: [['id', 'asc']],
      include: [Transport],
      where: {
        createdAt: {
          [Op.between]: [
            moment(dates.from, 'DD.MM.YYYY')
              .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
              .toDate(),
            moment(dates.to, 'DD.MM.YYYY')
              .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
              .toDate(),
          ],
        },
      },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.userRepository.create({
      name: createUserDto.name,
      surname: createUserDto.surname,
      middlename: createUserDto.middlename,
      login: createUserDto.login,
      password: createUserDto.password,
      role: createUserDto.role,
      phoneNumber: createUserDto.phoneNumber,
      workingPhoneNumber: createUserDto.workingPhoneNumber,
    });
    AppGateway.instance.userCreate(user);
    return user;
  }

  findDrivers() {
    return this.userRepository.findAll({ where: { role: ROLE.DRIVER } });
  }

  findNonDrivers() {
    return this.userRepository.findAll({
      where: { role: { [Op.ne]: ROLE.DRIVER } },
    });
  }

  async setPhoneNumberAndTransport(
    id: number,
    data: {
      workingPhoneNumber: string;
      transportId: number;
      fcmToken: string;
      version: string;
    },
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    await user.update({
      workingPhoneNumber: data.workingPhoneNumber,
      isOnDriverShift: true,
      fcmToken: data.fcmToken,
      version: data.version,
    });
    AppGateway.instance.userUpdate(user);
    const oldTransport = await this.transportRepository.findOne({
      where: { driverId: id, isDeleted: false },
    });
    if (oldTransport) await oldTransport.update({ driverId: null });
    const transport = await this.transportRepository.findOne({
      where: { id: data.transportId, isDeleted: false },
    });
    await transport.update({ driverId: id, withDriverSince: new Date() });
    await this.findOrStartShift(id);
    AppGateway.instance.transportUpdate(transport);
  }

  public async findAdminOrOperator(userId: number) {
    return await this.userRepository.findOne({
      where: {
        id: userId,
        role: {
          [Op.in]: [ROLE.ADMIN, ROLE.OPERATOR],
        },
      },
    });
  }

  async setFcm(
    id: number,
    data: {
      fcmToken: string;
    },
  ) {
    const user = await this.userRepository.findOne({ where: { id } });
    await user.update({
      fcmToken: data.fcmToken,
    });
  }

  async endDriverShift(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    await user.update({
      isOnDriverShift: false,
      fcmToken: null,
      version: null,
    });
    AppGateway.instance.userUpdate(user);
    const transport = await this.transportRepository.findOne({
      where: { driverId: user.id, isDeleted: false },
    });
    if (transport) {
      await transport.update({ driverId: null, withDriverSince: null });
      this.transportService.setStatus(transport.id, 'FREE');
    }
    await this.endShift(id);
  }

  async dayDriverShift(dates: { from: string; to: string }) {
    const shiftData = await this.shiftRepository.findAll({
      include: [User, Transport],
      where: {
        startShift: {
          [Op.between]: [
            moment(dates.from, 'DD.MM.YYYY')
              .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
              .toDate(),
            moment(dates.to, 'DD.MM.YYYY').add(1, 'days')
              .set({ hour: 6, minute: 59, second: 59, millisecond: 999 })
              .toDate(),
          ],
        },
      },
    });
    let transportTempIds = []
    shiftData.forEach((el) => {
      if (el.transport.transportType) { // у некоторых el.transport.transportType == null
        const temp = transportTempIds.find(t => t.transportType == el.transport.transportType.description)
        if (!temp)
          transportTempIds.push({ transportTypeId: el.transport.transportType.id , transportType: el.transport.transportType.description, dates: [] })
      }
    })
    let diffDays = moment(dates.to, 'DD.MM.YYYY').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).diff(moment(dates.from, 'DD.MM.YYYY').set({ hour: 0, minute: 0, second: 0, millisecond: 0 }), 'days')
    for (let d = 0; d <= diffDays; d++) {
      for (let s = 0; s < transportTempIds.length; s++) {
        const transports = await this.transportRepository.findAll({
          where:{
            transportTypeId: transportTempIds[s].transportTypeId
          }
        })
        const transportIds = transports.map((el) => el.id)
        const addShiftInOneDay = await this.shiftRepository.findAll({
          where: {
            transportId: { [Op.in]: transportIds },
            // transportId: [transportIds],
            startShift: {
              [Op.between]: [
                moment(dates.from, 'DD.MM.YYYY').add(d, 'days')
                  .set({ hour: 7, minute: 0, second: 0, millisecond: 0 })
                  .toDate(),
                moment(dates.from, 'DD.MM.YYYY').add(d + 1, 'days')
                  .set({ hour: 6, minute: 59, second: 59, millisecond: 999 })
                  .toDate(),
              ],
            },
          },
        });
        let summaryAllDayOnOrder = 0
        let summaryAllDayOnShift = 0
        addShiftInOneDay.forEach(el => {
          if (el.summaryAll && el.endShift && el.startShift) {
            summaryAllDayOnOrder = summaryAllDayOnOrder + el.summaryAll
            summaryAllDayOnShift = summaryAllDayOnShift + moment(el.endShift).diff(moment(el.startShift))
          }
          // if (summaryAllDayOnShift == 89820199) {
          //   console.log(addShiftInOneDay)
          // }
        })
        // console.log(summaryAllDayOnOrder, summaryAllDayOnShift, summaryAllDayOnOrder / summaryAllDayOnShift)
        transportTempIds.find((el) => el.transportType == transportTempIds[s].transportType).dates.push({
          date: moment(dates.from, 'DD.MM.YYYY').add(d, 'days')
            .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
            .toDate(),
          summaryAllDayOnOrder: summaryAllDayOnOrder,
          summaryAllDayOnShift: summaryAllDayOnShift,
          percentageOnOrder: summaryAllDayOnOrder / summaryAllDayOnShift
        })
      }
    }
    return transportTempIds
  }

  async findOperators() {
    await this.userRepository.update(
      { password: null },
      { where: { password: null } },
    );
    return this.userRepository.findAll({
      where: {
        role: {
          [Op.in]: [
            ROLE.ADMIN,
            ROLE.OPERATOR,
            ROLE.WATCHER,
            ROLE.WATCHER_WITH_REPORTS,
          ],
        },
      },
      attributes: ['login', 'surname', 'middlename', 'name'],
    });
  }

  findAll() {
    return this.userRepository.findAll();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      include: [Transport],
    });
    if (!user) throw new NotFoundException('Пользователь не найден!');
    return user;
  }

  async findCurrentShift(driverId: number, withHistory: boolean = false) {
    if (withHistory)
      return this.shiftRepository.scope('full').findOne({
        where: { driverId, isCurrent: true },
      });
    return this.shiftRepository.findOne({
      where: { driverId, isCurrent: true },
    });
  }

  async findOrStartShift(driverId: number) {
    const startedShift = await this.findCurrentShift(driverId);
    if (startedShift) return startedShift;
    return await this.shiftRepository.create({
      isCurrent: true,
      driverId,
      transportId: (
        await this.transportService.findOneByDriverId(driverId)
      )?.id,
      startShift: new Date(),
    });
  }

  async findCurrentOperatorShift(
    operatorFullname: string,
    transportId: number,
  ) {
    return this.operatorShiftRepository.findOne({
      where: { operatorFullname, transportId, date: new Date() },
    });
  }

  async findOrStartOperatorShift(
    operatorFullname: string,
    transportId: number,
  ) {
    const startedShift = await this.findCurrentOperatorShift(
      operatorFullname,
      transportId,
    );
    if (startedShift) return startedShift;
    return await this.operatorShiftRepository.create({
      operatorFullname,
      transportId,
    });
  }

  async endShift(driverId: number) {
    const startedShift = await this.findCurrentShift(driverId);
    if (!startedShift) return;
    await startedShift.end();
  }

  async findOneBylogin(login: string) {
    const user = await this.userRepository.findOne({ where: { login } });
    if (!user) throw new NotFoundException('Пользователь не найден!');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    if (updateUserDto.isOnLunch === true && user.isOnLunch == false) {
      updateUserDto.onLunchSince = new Date();
    } else if (updateUserDto.isOnLunch === false && user.isOnLunch == true) {
      updateUserDto.onLunchSince = null;
    }
    await user.update(updateUserDto);
    AppGateway.instance.userUpdate(user);
    return user;
  }

  async delete(id: number) {
    const user = await this.findOne(id);
    AppGateway.instance.userDelete(user);
    await user.destroy();
  }
}
