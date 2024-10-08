import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Module({
  controllers: [],
  providers: [NotificationService],
  imports: [],
  exports: [NotificationService],
})
export class NotificationModule {}
