import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender' })
  @Column()
  senderId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiver' })
  @Column()
  receiverId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;
}
