import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PasswordChangingReason } from '../enums/PasswordChangingReason.enum';

@Entity()
export class ChangingPassword {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

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
