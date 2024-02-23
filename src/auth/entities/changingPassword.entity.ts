import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PasswordChangingReason } from '../enums/PasswordChangingReason.enum';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class ChangingPassword {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  token: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  time: Date;

  @Column({ default: false })
  resetSuccess: boolean;

  @Column({
    type: 'enum',
    enum: PasswordChangingReason,
  })
  reason: PasswordChangingReason;
}
