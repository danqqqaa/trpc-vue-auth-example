import { BadRequestException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Control } from './control.model';
import { CreateControlDto } from './control.dto';
import { ManagementService } from 'src/management/management.service';
import { LimitService } from 'src/limit/limit.service';
import { MonthLimit } from 'src/limit/month-limit.model';
import { Management } from 'src/management/management.model';
import { Cron, CronExpression } from '@nestjs/schedule';
import sequelize, { Op } from 'sequelize';
import * as moment from 'moment';
@Injectable()
export class ControlService {
    constructor(
        @InjectModel(Control, 'GAZELLE_REPOSITORY')
        private readonly controlRepository: typeof Control,
        @Inject(forwardRef(() => LimitService))
        private readonly limitService: LimitService,
        @Inject(forwardRef(() => ManagementService))
        private readonly managementService: ManagementService,
        @InjectModel(MonthLimit, 'GAZELLE_REPOSITORY')
        private readonly monthLimitRepository: typeof MonthLimit,
    ) { }


    @Cron(`30 7 ${moment().daysInMonth() - 2} * *`)
    private async newControl() {
        console.log("newControl CRON")
        const nextMonth = moment().add(1, 'months');
        await this.createControl(nextMonth.year(), nextMonth.month())
        const months = await this.monthLimitRepository.findAll({
            where: {
                month: nextMonth.month(),
                year: nextMonth.year(),
            },
        });
        for (let i = 0; i < months.length; i++) {
            const management = await this.managementService.findOne(months[i].managementId);
            if (months[i].percentage == null) {
                await months[i].update({
                    plan: management.defaultLimit,
                    fact: management.defaultLimit,
                    percentage: management.defaultPercentage,
                })
            }
        }     
    }

    @Cron(`30 7 1 * *`)
    private async setHierarchy() {
        console.log("setHierarchy CRON")
        const today = moment();
        const monthsToday = await this.monthLimitRepository.findAll({
            where: {
                month: today.month(),
                year: today.year(),
            },
        });
        for (let i = 0; i < monthsToday.length; i++) {
            await this.limitService.updateHierarchy(monthsToday[i].managementId, monthsToday[i].fact, monthsToday[i].plan)
        }
        
    }

    public async getControl(year: number, month: number) {
        return this.controlRepository.findOne({
            where: {
                year: year,
                month: month,
            },
        });
    }
    public async getAllControl() {
        return this.controlRepository.findAll({});
    }
    public async createControl(year: number, month: number) {
        const exist = await this.controlRepository.findOne({
            where: {
                year: year,
                month: month,
            },
        })
        if (exist) throw new BadRequestException('month exist');

        const result = await this.controlRepository.create(
            {
                year: year,
                month: month,
            },
        );


        const existMonthLimit = await this.monthLimitRepository.findOne({
            where: {
                month: month,
                year: year,
            },
        });
        if (existMonthLimit) return result
        const today = moment();
        const managements = await this.managementService.findAll(today.year(), today.month());
        for await (const management of managements) {

            await this.monthLimitRepository.create({
                managementId: management.id,
                month: month,
                year: year,
                plan: management.defaultLimit,
                fact: management.defaultLimit,
                percentage: management.defaultPercentage,
            });
        }
        return result
    }
    public async editControl(year: number, month: number, createControlDto: CreateControlDto) {
        const existControl = await this.controlRepository.findOne({
            where: {
                month: month,
                year: year,
            },
        });
        if (!existControl) throw new NotFoundException('control not exist');
        await this.controlRepository.update(
            {
                productionPlanVolume: createControlDto.productionPlanVolume,
                productionFactVolume: createControlDto.productionFactVolume,
                realizationByHours: createControlDto.realizationByHours,
                discount: createControlDto.discount,
                fixedCost: createControlDto.fixedCost,
                veriableCost: createControlDto.veriableCost
            },
            {
                where: {
                    year: year,
                    month: month,
                },
            },
        );
        const result = this.controlRepository.findOne({
            where: {
                year: year,
                month: month,
            },
        })
        return result;
    }

    public async getMonthLimit(year: number, month: number) {
        return this.monthLimitRepository.findAll({
            where: {
                month: month,
                year: year,
            },
            include: [Management],
            order: [[sequelize.col('management.name'), 'asc']],
        });
    }

    public async editMonthLimit(year: number, month: number, data) {
        await this.limitService.updateMonthLimit(year, month, data)
        // await this.limitService.updateHierarchy(management.id, updatePlaceDto.defaultLimit)
    }
    public async editMonthLimits(year: number, month: number, data) {
        for (let i = 0; i < data.length; i++) {
            await this.limitService.updateMonthLimit(year, month, data[i])
            await this.managementService.update(data[i].management.id, data[i].management);
        }

        // await this.limitService.updateHierarchy(management.id, updatePlaceDto.defaultLimit)
    }
}
