import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationEntity } from './entity/notification.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { createNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(NotificationEntity) private notificationRepository : Repository<NotificationEntity>,
    
        @Inject(forwardRef(()=> UserService))
        private userService : UserService
    ){}

    async getAll(id : number) : Promise<NotificationEntity[]>{
        return await this.userService.getNotifications(id);
    }

    async createNotification(payload : createNotificationDto) : Promise<NotificationEntity | null>{
        const isSameUserAndNotNeedNotification = payload.receivedUser === payload.initiatorUser
        if(isSameUserAndNotNeedNotification) return null

        const notification = this.notificationRepository.create({
            notificationType : payload.notificationType,
            initiatorUser : payload.initiatorUser,
            receivedUser : payload.receivedUser,
            post : payload.post ??  null ,
            comment : payload.comment ?? null
        } as Partial<NotificationEntity>)

        return await this.notificationRepository.save(notification);
    }

    async readAll(id : number) : Promise<void>{
        const notifications = await this.notificationRepository.find({where : {id}});

        await Promise.all(notifications.map(async (n)=>{
            if(!n.isRead) await this.notificationRepository.update(n.id, {isRead: true})
        }))
    }

    async update(notificationId : number) : Promise<void>{
        await this.notificationRepository.update(notificationId, {isRead : true});
    }

    async delete(notificationId : number) : Promise<void>{
        await this.notificationRepository.delete(notificationId);
    }

    async deleteLastByInitiatorID(userId : number, targetId : number){
        const notificationArray = await this.notificationRepository.createQueryBuilder('notification')
            .where('notification.initiatorUser.id = :userId', {userId})
            .andWhere('notification.receivedUser.id = :targetId', {targetId})
            .andWhere('notification.notificationType = :type', { type: 'FOLLOW' })
            .orderBy('notification.createdAt', 'DESC')
            .take(1)
            .getMany();

        const notification = notificationArray?.[0]

        if(notification) await this.notificationRepository.delete(notification.id);
    }
}
