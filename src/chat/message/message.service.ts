import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { RoomService } from '../room/room.service';
import { Room } from '../room/entities/room.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private readonly roomService: RoomService,
    private readonly userService: UsersService,
  ) {}

  async createMessage(
    roomId: string,
    content: string,
    senderId: string,
  ): Promise<Message> {
    const room = await this.roomService.findOne(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const sender = await this.userService.findOne(senderId);
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    const message = this.messageRepository.create({ room, content, sender });
    return this.messageRepository.save(message);
  }

  async getMessagesByRoom(room: Room): Promise<Message[]> {
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.room', 'room')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('room.id = :roomId', { roomId: room.id })
      .getMany();
  }
}
