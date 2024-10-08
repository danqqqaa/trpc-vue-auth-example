import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Order } from 'src/order/models/order.model';
import { Customer } from 'src/customer/customer.model';
import { Transport } from 'src/transport/transport.model';
import { User } from 'src/user/user.model';

@Injectable()
export class NotificationService implements OnModuleInit {
  static instance: NotificationService;

  onModuleInit() {
    if (NotificationService.instance == null)
      NotificationService.instance = this;
  }

  static async sendFirebaseMessage(
    receiver: User | Customer,
    body: string,
    title: string,
  ) {
    const fcmToken = receiver.fcmToken;
    const role = receiver instanceof User ? receiver.role : 'CUSTOMER';
    const identificator =
      receiver instanceof User ? receiver.login : receiver.fullname;
  
    try {
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          body: body,
          title: title,
          // sound: 'default',
        },
        data: {
          role: receiver instanceof User ? receiver.role : 'CUSTOMER',
        },
      };
  
      await admin.messaging().send(message);
  
      console.log(
        `Sended notification to ${role}: ${identificator} ${new Date().toISOString()}`,
      );
    } catch (error) {
      console.error(
        `Error sending notification to ${role}: ${identificator} ${new Date().toISOString()}\n`,
        error,
      );
    }
  }

  static async sendNotificationLoadingStart(
    customer: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken)
      await NotificationService.sendFirebaseMessage(
        customer,
        `${transport.transportType?.description ?? transport.type} ${transport.transportNumber} начал погрузку груза по заказу #${order.id}, водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename} ${transport.driver.workingPhoneNumber}!`,
        `Начата погрузка груза заказа #${order.id}!`,
      );
  }

  static async sendNotificationLoadingEnd(
    customer: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken)
      await NotificationService.sendFirebaseMessage(
        customer,
        `${transport.transportType?.description ?? transport.type} ${transport.transportNumber} завершил погрузку груза по заказу #${order.id}, водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename} ${transport.driver.workingPhoneNumber}!`,
        `Завершена погрузка груза заказа #${order.id}!`,
      );
  }

  static async sendNotificationUnloadingStart(
    customer: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken)
      await NotificationService.sendFirebaseMessage(
        customer,
        `${transport.transportType?.description ?? transport.type} ${transport.transportNumber} начал разгрузку груза по заказу #${order.id}, водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename} ${transport.driver.workingPhoneNumber}!`,
        `Начата разгрузка груза заказа #${order.id}!`,
      );
  }

  static async sendNotificationExitToDestinationCargoReciever(
    customer: Customer,
    cargoReciever: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken)
      await NotificationService.sendFirebaseMessage(
        customer,
        `• Грузоотправитель: ${cargoReciever.fullname}\n• Тип ТС: ${transport.transportType?.description ?? transport.type}\n• Госномер: ${transport.transportNumber}\n• Водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename}\n• Телефон водителя: ${transport.driver.phoneNumber}\n• Груз: ${order.name}`,
        `Для вас отгружен груз:`,
      );
  }

  static async sendNotificationEntryToDestinationCargoReciever(
    customer: Customer,
    cargoReciever: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken)
      await NotificationService.sendFirebaseMessage(
        customer,
        `• Грузоотправитель: ${cargoReciever.fullname}\n• Тип ТС: ${transport.transportType?.description ?? transport.type}\n• Госномер: ${transport.transportNumber}\n• Водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename}\n• Телефон водителя: ${transport.driver.phoneNumber}\n• Груз: ${order.name}`,
        `Вам доставлен груз:`,
      );
  }

  static async sendNotificationAccepted(
    customer: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken) {
      await NotificationService.sendFirebaseMessage(
        customer,
        `${transport.transportType?.description ?? transport.type} ${transport.transportNumber} назначен на заказ #${order.id}, водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename} ${transport.driver.workingPhoneNumber}!`,
        `Заказ #${order.id} назначен!`,
      );
    }
  }

  static async sendNotificationEntryToCustomer(
    customer: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken)
      await NotificationService.sendFirebaseMessage(
        customer,
        `${transport.transportType?.description ?? transport.type} ${transport.transportNumber} прибыл к заказчику на заказ #${order.id}, водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename} ${transport.driver.workingPhoneNumber}!`,
        `${transport.transportType?.description ?? transport.type} ${transport.transportNumber} прибыл к заказчику!`,
      );
  }

  static async sendNotificationExitToDestination(
    customer: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken)
      await NotificationService.sendFirebaseMessage(
        customer,
        `${transport.transportType?.description ?? transport.type} ${transport.transportNumber} отправился в место назачения на заказ #${order.id}, водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename} ${transport.driver.workingPhoneNumber}!`,
        `${transport.transportNumber} отправился в место назачения!`,
      );
  }

  static async sendNotificationEntryToDestination(
    customer: Customer,
    order: Order,
    transport: Transport,
  ) {
    if (customer && customer.fcmToken)
      await NotificationService.sendFirebaseMessage(
        customer,
        `${transport.transportType?.description ?? transport.type} ${transport.transportNumber} прибыл в место назачения на заказ #${order.id}, водитель: ${transport.driver.surname} ${transport.driver.name} ${transport.driver.middlename} ${transport.driver.workingPhoneNumber}!`,
        `${transport.transportNumber} прибыл в место назачения!`,
      );
  }

  static async sendDriverNotification(driver: User, order: Order) {
    if (order) {
      await NotificationService.sendFirebaseMessage(
        driver,
        `Отправление: ${order.departurePoint.name}
      Назначение: ${order.destination.name}`,
        '🚚 Непринятый заказ!',
      );
    }
  }
}
