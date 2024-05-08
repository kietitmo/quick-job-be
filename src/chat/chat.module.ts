import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';

@Module({
  providers: [ChatGateway],
  imports: [MessageModule, RoomModule],
})
export class ChatModule {}
