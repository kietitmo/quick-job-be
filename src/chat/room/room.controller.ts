import { Controller, Post, Body } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async createRoom(@Body() { user1, user2 }: { user1: string; user2: string }) {
    return this.roomService.findOrCreateRoom(user1, user2);
  }
}
