import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private readonly userService: UsersService,
  ) {}

  async findOrCreateRoom(user1Id: string, user2Id: string): Promise<Room> {
    const user1 = await this.userService.findOne(user1Id);
    const user2 = await this.userService.findOne(user2Id);

    if (!user1 || !user2) {
      throw new NotFoundException('User not found');
    }

    const sortedUsers = [user1, user2].sort((a, b) => a.id.localeCompare(b.id)); // Sắp xếp theo ID của người dùng
    let room = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.user1', 'user1')
      .leftJoinAndSelect('room.user2', 'user2')
      .where('user1.id = :user1Id', { user1Id: sortedUsers[0].id })
      .andWhere('user2.id = :user2Id', { user2Id: sortedUsers[1].id })
      .getOne();

    if (!room) {
      room = await this.roomRepository.save({
        user1: sortedUsers[0],
        user2: sortedUsers[1],
      });
    }
    return room;
  }

  async findOne(id: string): Promise<Room> {
    return this.roomRepository.findOneBy({ id });
  }
}
