import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contact } from './contact.model';

@Module({
  controllers: [ContactController],
  providers: [ContactService],
  imports: [SequelizeModule.forFeature([Contact], 'GAZELLE_REPOSITORY')],
  exports: [ContactService],
})
export class ContactModule {}
