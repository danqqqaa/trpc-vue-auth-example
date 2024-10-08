import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';
import { Loading } from './loading.model';
import { CreateLoadingDto, UpdateLoadingDto } from './dto';
import { TransportTypeLoadingAssociation } from './transport-type-loading.association';
import { TransportType } from 'src/recommendation/models/transport-type.model';

@Injectable()
export class LoadingService {
  constructor(
    @InjectModel(Loading, 'GAZELLE_REPOSITORY')
    private readonly loadingRepository: typeof Loading,
    @InjectModel(TransportTypeLoadingAssociation, 'GAZELLE_REPOSITORY')
    private readonly transportTypeLoadingAssociationRepository: typeof TransportTypeLoadingAssociation,
    @InjectModel(TransportType, 'GAZELLE_REPOSITORY')
    private readonly transportTypeRepository: typeof TransportType,
  ) { }

  public findAll() {
    return this.loadingRepository.findAll({
      include: [
        {
          model: TransportType,
        },
      ],
      order: [['name', 'asc']],
    });
  }

  async create(createLoadingDto: CreateLoadingDto) {
    const result = await this.loadingRepository.create(createLoadingDto);
    for (let i = 0; i < createLoadingDto.transportTypes?.length; i++) {
      await this.transportTypeLoadingAssociationRepository.create({
        loadingId: result.id,
        transportTypeId: createLoadingDto.transportTypes[i].id
      })
    }
    return result;
  }

  //   async create(createLoadingDto: CreateLoadingDto) {
  //   const temp1 =  [{"temp":"АБК гвоздильный цех (УС)"},{"temp":"АБК ИЦ"},{"temp":"АБК ООО \"МРК\""},{"temp":"АБК ППК-1"},{"temp":"АБК ППК-3"},{"temp":"АБК ЦОГП"},{"temp":"АБК ЦПП"},{"temp":"Автовесовая (ул. Харьковская)"},{"temp":"Автовесовая ЦПП"},{"temp":"АЗС (Электросети)"},{"temp":"АЗС ЦПП"},{"temp":"Весовая КПП-7 ПАО \"ММК\""},{"temp":"Гараж РМУ ООО \"ОСК\""},{"temp":"Гараж служебных автомашин"},{"temp":"ГОК ПАО \"ММК\" (23 проходная)"},{"temp":"ГОП ПАО \"ММК\" (проходная №41)"},{"temp":"ДОК ПАО \"ММК\""},{"temp":"ИЦ-1"},{"temp":"ИЦ-2"},{"temp":"ИЦ-3"},{"temp":"ИЦ-4"},{"temp":"КИПиА ООО \"ОСК\""},{"temp":"Кислородная станция ПАО \"ММК\""},{"temp":"Котельная ОАО \"ММК-МЕТИЗ\""},{"temp":"КПП 1 ОАО \"ММК-МЕТИЗ\""},{"temp":"КПП 17/18 ОАО \"ММК-МЕТИЗ\""},{"temp":"КПП 2/3 ОАО \"ММК-МЕТИЗ\""},{"temp":"КПП 3 ОАО \"ММК-МЕТИЗ\""},{"temp":"Красная Башкирия"},{"temp":"КРМЦ-1 АО \"РМК\""},{"temp":"КС Вознесения Христова"},{"temp":"ЛПЦ-3 ПАО \"ММК\""},{"temp":"ЛПЦ-8 ПАО \"ММК\""},{"temp":"ММК-Индустриальный парк"},{"temp":"МЦ ООО \"МРК\""},{"temp":"ООО \"Огнеупор\""},{"temp":"ООО \"Солди Плюс\" (Индустриальный парк)"},{"temp":"ООО \"ЭРЦ\""},{"temp":"ПК-1-1"},{"temp":"ПК-1-1 (РМУ ООО \"ОСК\")"},{"temp":"ПК-1-2"},{"temp":"ПК-1-3"},{"temp":"ПК-1-4"},{"temp":"ПК-1-5"},{"temp":"ПК-1-6"},{"temp":"ПК-1-7"},{"temp":"ПК-1-8 (Ebner)"},{"temp":"ПК-1-8 (склад)"},{"temp":"ПК-1-8 (упаковка)"},{"temp":"ПК-1-9 (Г02)"},{"temp":"ПК-2-10"},{"temp":"ПК-2-11"},{"temp":"ПК-2-12"},{"temp":"ПК-2-13"},{"temp":"ПК-2-14"},{"temp":"ПК-2-15"},{"temp":"ПК-2-16"},{"temp":"ПК-3-17"},{"temp":"ПК-3-18"},{"temp":"ПК-3-19"},{"temp":"ПК-3-20"},{"temp":"ППК-1-1"},{"temp":"ППК-1-2"},{"temp":"ППК-1-3"},{"temp":"ППК-1-4"},{"temp":"ППК-1-5"},{"temp":"ППК-1-6 (Г25)"},{"temp":"ППК-1-7 (Г25)"},{"temp":"ППК-2-1"},{"temp":"ППК-2-10"},{"temp":"ППК-2-11"},{"temp":"ППК-2-2"},{"temp":"ППК-2-3"},{"temp":"ППК-2-4"},{"temp":"ППК-2-5"},{"temp":"ППК-2-6 (Г11)"},{"temp":"ППК-2-7"},{"temp":"ППК-2-8 (Г11)"},{"temp":"ППК-2-9"},{"temp":"ППК-3-1"},{"temp":"ППК-3-2"},{"temp":"ППК-3-3"},{"temp":"ППК-3-4 (Г17)"},{"temp":"ППК-4-1"},{"temp":"ППК-4-2"},{"temp":"ППК-4-3"},{"temp":"ППК-4-4"},{"temp":"ППК-4-5 (Г24)"},{"temp":"пр. Карла Маркса 13"},{"temp":"пр. Карла Маркса 141"},{"temp":"пр. Карла Маркса 7/1"},{"temp":"пр. Ленина 10"},{"temp":"пр. Ленина 133/2"},{"temp":"пр. Пушкина 6"},{"temp":"пр. Пушкина 6/1"},{"temp":"пр. Пушкина 8"},{"temp":"пр. Пушкина 9"},{"temp":"Рем мастерская ООО \"ОСК\""},{"temp":"Склад №21 ПАО \"ММК\""},{"temp":"Склад №32 ПАО \"ММК\""},{"temp":"Склад №50 ПАО \"ММК\""},{"temp":"Склад М35 ПАО \"ММК\""},{"temp":"Склад металла (лесосклад) "},{"temp":"Склад металла №1"},{"temp":"Склад металла №4"},{"temp":"Склад металла №4/лесосклад"},{"temp":"Склад СВХ ПАО \"ММК\""},{"temp":"Склад Т18 ПАО \"ММК\""},{"temp":"СПП-1-1 (Г10)"},{"temp":"СПП-1-2 (Г12)"},{"temp":"СПП-1-3"},{"temp":"СПП-1-4"},{"temp":"СПП-1-5"},{"temp":"СПП-1-6"},{"temp":"СПП-1-7"},{"temp":"СПП-1-8"},{"temp":"СПП-2-2"},{"temp":"СПП-2-3"},{"temp":"СПП-2-4 (Г05)"},{"temp":"СПП-2-5 (Г05)"},{"temp":"СПП-2-6"},{"temp":"СПП-2-7"},{"temp":"СПП-3-1 (Г06)"},{"temp":"СПП-3-3"},{"temp":"СПП-3-4"},{"temp":"СПП-4-1"},{"temp":"СПП-эстакада"},{"temp":"Станция \"Метизная\""},{"temp":"ТК \"Байкал сервис\""},{"temp":"ТК \"Деловые линии\""},{"temp":"ТК \"КИТ\""},{"temp":"ТК \"ЛУЧ\""},{"temp":"ТК \"ПЭК\""},{"temp":"ТК \"Экспресс-Авто\""},{"temp":"ул. 9 Мая 12/2"},{"temp":"ул. Белорецкое шоссе 5"},{"temp":"ул. Вознесенская 33"},{"temp":"ул. Вознесенская 33б"},{"temp":"ул. Ворошилова 7"},{"temp":"ул. Гагарина 35"},{"temp":"ул. Гагарина 35/1"},{"temp":"ул. Гагарина 35/3"},{"temp":"ул. Герцена 2"},{"temp":"ул. Грязнова 33/1"},{"temp":"ул. Дачное шоссе 16"},{"temp":"ул. Елькина 18"},{"temp":"ул. Енисейская 135"},{"temp":"ул. Заводская 1/2"},{"temp":"ул. Калибровщиков 11"},{"temp":"ул. Калибровщиков 27"},{"temp":"ул. Кирова 42/1"},{"temp":"ул. Клара Цеткин 16б"},{"temp":"ул. Комсомольская 126/2"},{"temp":"ул. Комсомольская 130"},{"temp":"ул. Крылова 23"},{"temp":"ул. Локомотивная 6/3"},{"temp":"ул. Луговая"},{"temp":"ул. Менжинского 11"},{"temp":"ул. Метизников 5"},{"temp":"ул. Московкая 26/3"},{"temp":"ул. Моховая 18"},{"temp":"ул. Октябрьская 8"},{"temp":"ул. Первая Северо-Западная 1-я, 2"},{"temp":"ул. Пржевальского 4"},{"temp":"ул. Складская 21"},{"temp":"ул. Складская 5"},{"temp":"ул. Советская 160"},{"temp":"ул. Советская 70"},{"temp":"ул. Советской Армии 55/2"},{"temp":"ул. Суворова 9"},{"temp":"ул. Танкистов 19"},{"temp":"ул. Чаадаева 24"},{"temp":"ул. Шоссейная 62"},{"temp":"ул. Электросети 18"},{"temp":"УПО ГОП ООО \"ОСК\""},{"temp":"УРЗА (ЛПЦ-5) ООО \"МРК\""},{"temp":"Уч. металлолома"},{"temp":"Уч. стропов"},{"temp":"участок подъемных сооружений ОАО \"ММК - МЕТИЗ\""},{"temp":"Цех вентиляции ПАО \"ММК\""},{"temp":"ЦКП (ЦЗЛ)"},{"temp":"ЦОГП Г01-1"},{"temp":"ЦОГП Г03-1"},{"temp":"ЦОГП Г03-2"},{"temp":"ЦОГП Г04-3"},{"temp":"ЦОГП Г09-1"},{"temp":"ЦОГП Г09-2"},{"temp":"ЦОГП Г09-3"},{"temp":"ЦОГП Г09-4"},{"temp":"ЦОГП Г09-5"},{"temp":"ЦОГП Г21-1"},{"temp":"ЦПП-1"},{"temp":"ЦПП-14"},{"temp":"ЦПП-15"},{"temp":"ЦПП-16"},{"temp":"ЦПП-17"},{"temp":"ЦПП-18"},{"temp":"ЦПП-19"},{"temp":"ЦПП-2"},{"temp":"ЦПП-20"},{"temp":"ЦПП-3"},{"temp":"ЦПП-4"},{"temp":"ЦПП-5"},{"temp":"ЦПП-6"},{"temp":"ЦПП-7"},{"temp":"ЦПП-8"},{"temp":"ЦПП-9"},{"temp":"ЦРМО-2 ООО \"МРК\""},{"temp":"ЦРМО-3 ООО \"МРК (12 проходная)"},{"temp":"ЦРЭМЦ ООО \"ОСК\""},{"temp":"ЦЭР-1"},{"temp":"ЦЭР-10"},{"temp":"ЦЭР-11"},{"temp":"ЦЭР-12"},{"temp":"ЦЭР-13"},{"temp":"ЦЭР-14"},{"temp":"ЦЭР-15"},{"temp":"ЦЭР-16"},{"temp":"ЦЭР-17"},{"temp":"ЦЭР-2"},{"temp":"ЦЭР-3"},{"temp":"ЦЭР-4"},{"temp":"ЦЭР-5"},{"temp":"ЦЭР-6"},{"temp":"ЦЭР-7"},{"temp":"ЦЭР-8"},{"temp":"ЦЭР-9"}]
  //   // const result = await this.loadingRepository.create(createLoadingDto);
  //   for (let i = 0; i < temp1.length; i++) {
  //     await this.loadingRepository.create({
  //       name: temp1[i].temp
  //     });
  //   }
  //   return 'good';
  // }

  async update(id: number, updateLoadingDto: UpdateLoadingDto) {
    const loading = await  this.loadingRepository.findOne({
      where: { id },
    });
    await this.transportTypeLoadingAssociationRepository.destroy({
      where: {
        loadingId: loading.id,
      },
    });
    for (let i = 0; i < updateLoadingDto.transportTypes?.length; i++) {
      await this.transportTypeLoadingAssociationRepository.create({
        loadingId: loading.id,
        transportTypeId: updateLoadingDto.transportTypes[i].id
      })
    }
    const result = await loading.update(updateLoadingDto);
    return result;
  }

  async delete(id: number) {
    const loading = await this.loadingRepository.findOne({
      where: { id },
    });
     await this.transportTypeLoadingAssociationRepository.destroy({
      where: {
        loadingId: loading.id,
      },
    });
    await loading.destroy();
    return "delete"
  }
}
