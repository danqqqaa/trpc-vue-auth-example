import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Customer } from 'src/customer/customer.model';
import { Management } from 'src/management/management.model';
import { ManagementService } from 'src/management/management.service';
import { OrderStats } from 'src/order/models/order-stats.model';
import { Order } from 'src/order/models/order.model';
import { DayLimit } from './day-limit.model';
import { MonthLimit } from './month-limit.model';
import * as moment from 'moment';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Hierarchy } from './hierarchy.model';
import { Op } from 'sequelize';
import { LimitRequest } from './limit-request.model';
import { CreateLimitRequestDto } from 'src/management/dto/create-limit-request.dto';
import { ChangeLimitRequestStatusDto } from 'src/management/dto/change-limit-request-status.dto';
import { AppGateway } from 'src/app.gateway';
import { Place } from 'src/place/place.model';
import { ControlService } from 'src/control/control.service';

@Injectable()
export class LimitService implements OnModuleInit {
  constructor(
    @InjectModel(DayLimit, 'GAZELLE_REPOSITORY')
    private readonly dayLimitRepository: typeof DayLimit,
    @InjectModel(MonthLimit, 'GAZELLE_REPOSITORY')
    private readonly monthLimitRepository: typeof MonthLimit,
    @InjectModel(OrderStats, 'GAZELLE_REPOSITORY')
    private readonly orderStatsRepository: typeof OrderStats,
    @InjectModel(Hierarchy, 'GAZELLE_REPOSITORY')
    private readonly hierarchyRepository: typeof Hierarchy,
    @InjectModel(LimitRequest, 'GAZELLE_REPOSITORY')
    private readonly limitRequestRepository: typeof LimitRequest,
    @InjectModel(Place, 'GAZELLE_REPOSITORY')
    private readonly placeRepository: typeof Place,
    @InjectModel(Customer, 'GAZELLE_REPOSITORY')
    private readonly customerRepository: typeof Customer,
    @Inject(forwardRef(() => ManagementService))
    private readonly managementService: ManagementService,
  ) { }

  async onModuleInit() {
    await this.resetLimits();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async cronJob() {
    await this.resetLimits(true);
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  private async resetHierarchySpends() {
    await this.resetLimits();
    await this.hierarchyRepository.update({ monthUsed: 0 }, { where: {} });
    AppGateway.instance.hierarchyReset();
  }

  public async changeLimitRequestStatus(
    changeLimitRequestStatus: ChangeLimitRequestStatusDto,
    limitRequestId: number,
  ) {
    const limitRequest = await this.limitRequestRepository.findOne({
      where: { id: limitRequestId },
      include: [Customer, Hierarchy, MonthLimit],
    });
    await limitRequest.update(changeLimitRequestStatus);
    AppGateway.instance.limitRequestUpdate(limitRequest);
    if (changeLimitRequestStatus.approved) {
      await limitRequest.hierarchy.increment({
        monthFactLimit: limitRequest.amount,
      });
      AppGateway.instance.hierarchyUpdate(limitRequest.hierarchy);
      if (limitRequest.hierarchy.bossId == null) {
        await limitRequest.month.increment({ fact: limitRequest.amount });
        AppGateway.instance.managementUpdate(
          await this.managementService.findOne(limitRequest.month.managementId),
        );
      }
    }
  }

  public async findHierarchy(customer: Customer) {
    const management = await this.managementService.findCustomerManagement(
      customer,
    );
    if (management) {
      const month = await this.createMonthIfNotExists(management);
      if (month)
        return this.hierarchyRepository.findAll({
          where: !management.isSubdivision
            ? {
              [Op.or]: [{ bossId: customer.id }, { ownerId: customer.id }],
            }
            : { subdivision: management.subdivision },
          include: {
            model: LimitRequest,
            where: {
              monthId: month.id,
            },
            required: false,
          },
        });
    }
  }

  public async addLimitRequest(
    customer: Customer,
    createLimitRequestDto: CreateLimitRequestDto,
  ) {
    const management = await this.managementService.findCustomerManagement(
      customer,
    );
    const month = await this.findMonth(management);
    const hierarchy = await this.hierarchyRepository.findOne({
      where: management.isSubdivision
        ? { subdivision: management.subdivision }
        : { ownerId: customer.id },
    });
    const lr = await this.limitRequestRepository.create({
      amount: createLimitRequestDto.amount,
      monthId: month.id,
      ownerId: customer.id,
      hierarchyId: hierarchy.id,
    });
    AppGateway.instance.limitRequestUpdate(lr);
    return lr;
  }

  public async findLimits(managementId: number) {
    const management = await this.managementService.findOne(managementId);
    const month = await this.findMonth(management);
    return this.limitRequestRepository.findAll({
      where: !management.isSubdivision
        ? {
          monthId: month.id,
          ownerId: management.bossId,
          approved: false,
          declined: false,
        }
        : {
          monthId: month.id,
          approved: false,
          declined: false,
        },
    });
  }

  public async bindBossToHierarchy({
    customer,
    management,
  }: {
    customer: Customer;
    management: Management;
    monthPlanLimit: number;
    isSubdivision?: boolean;
    subdivision?: string;
  }) {
    if (!management.isSubdivision) {
      await this.bindCustomerToManagement(customer, management);
    } else {
      const customers = await this.customerRepository.findAll({
        where: { subdivision: management.subdivision },
      });
      for (let i = 0; i < customers.length; i++) {
        await this.bindCustomerToManagement(customers[i], management);
      }
    }
  }

  public async bindCustomerToManagement(
    customer: Customer,
    management: Management,
  ) {
    const hierarchy = await this.hierarchyRepository.findOne({
      where: { ownerId: customer.id, managementId: management.id},
    })
    if (!hierarchy) {
      const today = moment();
      const monthLimit = await this.monthLimitRepository.findOne({
        where: { managementId: management.id, month: today.month(), year: today.year(), },
      })
      const h = await this.hierarchyRepository.create({
        ownerId: customer.id,
        subdivision: management.subdivision,
        isSubdivision: management.isSubdivision,
        managementId: management.id,
        monthPlanLimit: monthLimit.plan,
        monthFactLimit: monthLimit.fact,
      });
      AppGateway.instance.hierarchyUpdate(h);
    }
  }

  public async addToMyHierarchy(
    me: Customer,
    customer: Customer,
    management: Management,
    monthPlanLimit: number,
  ) {
    const h = await this.hierarchyRepository.create({
      bossId: me.id,
      ownerId: customer.id,
      managementId: management.id,
      monthPlanLimit,
      monthFactLimit: monthPlanLimit,
    });
    AppGateway.instance.hierarchyUpdate(h);
    AppGateway.instance.managementUpdate(management);
    return h;
  }

  public async updateLimits(
    me: Customer,
    customer: Customer,
    management: Management,
    monthPlanLimit: number,
  ) {
    const h = await this.hierarchyRepository.findOne({
      where: {
        bossId: me.id,
        ownerId: customer.id,
        managementId: management.id,
      },
    });
    await h.update({
      monthPlanLimit,
      monthFactLimit: monthPlanLimit,
    });
    AppGateway.instance.hierarchyUpdate(h);
    AppGateway.instance.managementUpdate(management);
    return h;
  }

  public async rebindBossHierarchy(oldBossId: number, newBossId: number) {
    await this.hierarchyRepository.update(
      {
        bossId: newBossId,
      },
      {
        where: {
          bossId: oldBossId,
        },
      },
    );
    AppGateway.instance.hierarchyReset();
  }

  public async removeCustomerHierarchy(customerId: number) {
    await this.hierarchyRepository.destroy({
      where: {
        ownerId: customerId,
      },
    });
    AppGateway.instance.hierarchyReset();
  }

  public async updateMonthLimit(year, month, data) {
    const today = moment();
    const monthLimit = await this.monthLimitRepository.findOne({
      where: { managementId: data.management.id, month: month, year: year, },
    })
    await monthLimit.update({
      plan: data.plan, 
      fact: data.fact,
      percentage: data.percentage,
      technologicalTransport: data.technologicalTransport,
    })
    const monthLimitNew = await this.monthLimitRepository.findOne({
      where: { managementId: data.management.id, month: month, year: year, },
    })
    if (monthLimitNew.month == today.month() && monthLimitNew.year == today.year()) {
      await this.updateHierarchy(data.management.id, data.fact, data.plan)
    }
    AppGateway.instance.managementUpdate(
      await this.managementService.findOne(data.management.id),
    );
  }

  public async updateHierarchy(managementId: number, defaultLimitFact: number, defaultLimitPlan: number) {
    const hierarchy = await this.hierarchyRepository.findAll({
      where: { managementId: managementId },
    });
    for (let i = 0; i < hierarchy.length; i++) {
      await hierarchy[i].update({
        monthPlanLimit: defaultLimitPlan,
        monthFactLimit: defaultLimitFact,
      })
      AppGateway.instance.hierarchyUpdate(hierarchy[i]);
    }
  }


  private async resetLimits(fromCron: boolean = false) {
    const today = moment();
    const managements = await this.managementService.findAll(today.year(), today.month());
    for await (const management of managements) {
      const month = await this.createMonthIfNotExists(management);
      await this.createDayIfNotExists(month);
    }
    if (fromCron) {
      await this.hierarchyRepository.update({ dayLimitUsed: 0 }, { where: {} });
      AppGateway.instance.hierarchyReset();
    }
  }

  public async spend(
    order: Order,
    customer: Customer,
    stats: OrderStats,
    isCargoReciever: boolean,
  ) {
    if (!!customer) {
      const management = await this.managementService.findCustomerManagement(
        customer,
      );
      if (management) {
        const spendedValue = await this.getSpendedValue(
          order,
          management,
          stats,
          isCargoReciever,
        );
        if (isCargoReciever) {
          await stats.update({ cargoRecieverLimit: spendedValue });
        } else {
          await stats.update({ cargoSenderLimit: spendedValue });
        }
        const month = await this.createMonthIfNotExists(management);
        const day = await this.createDayIfNotExists(month);
        await month.increment({ used: spendedValue });
        await day.increment({
          used: spendedValue,
        });
        AppGateway.instance.managementUpdate(management);
        await this.hierarchyRepository.spend(customer.id, spendedValue);
      }
    }
  }

  private async getSpendedValue(
    order: Order,
    management: Management,
    stats: OrderStats,
    isCargoReciever: boolean,
  ): Promise<number> {
    if (!management.isMinutes) {
      const limit = isCargoReciever
        ? management.operatingSpeedVariable *
        (this.toHours(stats.unloadingWaiting) +
          this.toHours(stats.unloadingTime))
        : this.metersToKilo(order.routeLength) +
        management.operatingSpeedVariable *
        (this.toHours(stats.loadingWaitingTime) +
          this.toHours(stats.loadingTime) +
          this.toHours(stats.afterLoadingWaitingTime));
      return Number(limit.toFixed(2));
    }
    const place = await this.placeRepository.findOne({
      where: { id: order.destinationId },
    });
    var minutes = this.checkMoreThanMinutes(stats.loadingTime);
    minutes += this.toMinutes(stats.driveTime);
    minutes += this.checkMoreThanMinutes(stats.unloadingTime, place.norm);
    return Number(minutes.toFixed(2));
  }

  public metersToKilo(meters: number) {
    if (!meters || meters == 0) return 0;
    return Number((meters / 1000).toFixed(1));
  }

  private checkMoreThanMinutes(time: number, minutes: number = 15) {
    const _time = this.toMinutes(time);
    return _time > minutes ? (_time - minutes) * 2 + minutes : _time;
  }

  private toMinutes(millisec: number) {
    if (!millisec || isNaN(Number(millisec))) return 0;
    return Number(millisec) / 60000;
  }

  private toHours(millisec: number) {
    const minutes = this.toMinutes(millisec);
    return minutes / 60;
  }

  public async createMonth(management: Management) {
    if (!management) return;
    const today = moment();
    const month = this.monthLimitRepository.create({
      managementId: management.id,
      month: today.month(),
      year: today.year(),
      plan: management.defaultLimit,
      fact: management.defaultLimit,
      percentage: management.defaultPercentage,
    });
    AppGateway.instance.managementUpdate(
      await this.managementService.findOne(management.id),
    );
    return month;
  }

  public async findMonth(management: Management) {
    if (!management) return;
    const today = moment();
    return this.monthLimitRepository.findOne({
      where: {
        managementId: management.id,
        month: today.month(),
        year: today.year(),
      },
    });
  }

  public async createMonthIfNotExists(management: Management) {
    const month = await this.findMonth(management);
    if (!month) return await this.createMonth(management);
    return month;
  }

  public async createDay(month: MonthLimit) {
    const today = moment();
    const day = this.dayLimitRepository.create({
      day: today.date(),
      monthId: month.id,
    });
    AppGateway.instance.managementUpdate(
      await this.managementService.findOne(month.managementId),
    );
    return day;
  }

  public async findDay(month: MonthLimit) {
    const today = moment();
    return this.dayLimitRepository.findOne({
      where: {
        day: today.date(),
        monthId: month.id,
      },
    });
  }

  public async createDayIfNotExists(month: MonthLimit) {
    const day = await this.findDay(month);
    if (!day) return await this.createDay(month);
    return day;
  }

  public async removeMonths(management: Management) {
    const hierarchy = await this.hierarchyRepository.findAll({
      where: { managementId: management.id },
    });
    await this.limitRequestRepository.destroy({
      where: { hierarchyId: hierarchy.map((h) => h.id) },
    });
    await this.hierarchyRepository.destroy({
      where: { managementId: management.id },
    });
    const months = await this.monthLimitRepository.findAll({
      where: { managementId: management.id },
    });
    await this.dayLimitRepository.destroy({
      where: { monthId: months.map((m) => m.id) },
    });
    await this.monthLimitRepository.destroy({
      where: { managementId: management.id },
    });

    return hierarchy.map((h) => h.ownerId);
  }

  async getMyHierarchyUsers(userId: number, management: Management) {
    const hierarhies = await this.hierarchyRepository.findAll({
      where: management.isSubdivision
        ? { subdivision: management.subdivision }
        : { [Op.or]: [{ bossId: userId }, { ownerId: userId }] },
      attributes: ['ownerId'],
    });
    return hierarhies.map((h) => h.ownerId);
  }

}
