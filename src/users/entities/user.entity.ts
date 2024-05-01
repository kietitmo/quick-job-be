import { Role } from 'src/auth/enums/role.enum';
import { UserCreator } from 'src/auth/enums/userCreator.enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column()
  fullName: string;

  @Column({ unique: true, nullable: true })
  phoneNumber: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.user,
  })
  role: Role;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserCreator,
    default: UserCreator.unknown,
  })
  createdBy: UserCreator;

  @Column({
    nullable: true,
    default: null,
  })
  avatarUrl: string;
}
