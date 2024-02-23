import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    try {
      const message = this.messageRepository.create(createMessageDto);
      return this.messageRepository.save(message);
    } catch (error) {
      console.error('Create message error:', error);
      throw new Error('Failed to create message.');
    }
  }

  async findAll(): Promise<Message[]> {
    try {
      return await this.messageRepository.find();
    } catch (error) {
      console.error('Find all message error:', error);
      throw new Error('Failed to find all message.');
    }
  }

  async getChatHistory(user1: string, user2: string) {
    try {
      return await this.messageRepository
        .createQueryBuilder('message')
        .orderBy('message.sentAt', 'DESC')
        .andWhere(
          '(message.senderId = :user1) or (message.senderId = :user1)',
          { user1 },
        )
        .andWhere(
          '(message.senderId = :user2) or (message.senderId = :user2)',
          { user2 },
        )
        .getMany();
    } catch (error) {
      console.error('Find all message error:', error);
      throw new Error('Failed to find all message.');
    }
  }
}
