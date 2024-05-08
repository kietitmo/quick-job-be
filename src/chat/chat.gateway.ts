import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from 'src/chat/message/message.service';
import { RoomService } from './room/room.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(
    private readonly roomService: RoomService,
    private readonly messageService: MessageService,
  ) {}

  @WebSocketServer()
  server: Server;
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, { user1Id, user2Id }) {
    const room = await this.roomService.findOrCreateRoom(user1Id, user2Id);
    client.join(room.id);
    console.log('joined room: ', room.id);
    const messages = await this.messageService.getMessagesByRoom(room);
    client.emit('messages', messages);
    client.emit('roomId', room.id);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, { roomId, content, senderId }) {
    console.log(roomId, content, senderId);

    const newMessage = await this.messageService.createMessage(
      roomId,
      content,
      senderId,
    );
    this.server.to(roomId).emit('message', newMessage);
  }
}
