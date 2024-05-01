import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway {
  constructor(private readonly messagesService: MessagesService) {}
  @WebSocketServer()
  server: Server;
  private readonly privateRooms: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    console.log(client.handshake.query);
    // const userId = client.handshake.query.userId.toString();
    // client.data = { userId };

    // const privateRoom = `private-${userId}`;
    // client.join(privateRoom);

    // if (!this.privateRooms.has(userId)) {
    //   this.privateRooms.set(userId, new Set<string>());
    // }
    // this.privateRooms.get(userId).add(privateRoom);

    // this.sendChatHistory(client, userId);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const { userId } = client.data;
    const userRooms = this.privateRooms.get(userId);
    if (userRooms) {
      userRooms.delete(`private-${userId}`);
    }
  }

  @SubscribeMessage('createMessage')
  create(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = this.messagesService.create(createMessageDto);
    return message;
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.messagesService.findAll();
  }

  @SubscribeMessage('chat')
  async handleChat(client: Socket, payload: any): Promise<void> {
    console.log(
      `Message from ${client.data.userId} to ${payload.to}: ${payload.message}`,
    );

    const message = new CreateMessageDto();
    message.senderId = client.data.userId;
    message.receiverId = payload.to;
    message.content = payload.message;

    const savedMessage = await this.messagesService.create(message);

    const privateRoom = `private-${savedMessage.receiver.id}`;
    client
      .to(privateRoom)
      .emit('chat', { sender: savedMessage.sender.id, message });

    client.emit('chat', { sender: savedMessage.sender.id, message });

    client.to(privateRoom).emit('typing', { sender: savedMessage.sender.id });
  }

  @SubscribeMessage('history')
  async handleHistory(client: Socket, payload: any): Promise<void> {
    const { withUser } = payload;

    this.sendChatHistory(client, withUser);
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: any): void {
    const { userId } = client.data;
    const { to } = payload;

    const privateRoom = `private-${to}`;
    client.to(privateRoom).emit('typing', { sender: userId });
  }

  private async sendChatHistory(
    sender: Socket,
    receiver: string,
  ): Promise<void> {
    const history = await this.messagesService.getChatHistory(
      sender.data.userId,
      receiver,
    );
    sender.emit('history', { receiver, history });
  }
}
