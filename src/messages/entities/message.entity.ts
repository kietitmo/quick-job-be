import { User } from 'src/users/entities/user.entity';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  receiver: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;
}
