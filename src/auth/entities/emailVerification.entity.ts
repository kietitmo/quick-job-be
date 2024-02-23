import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  emailToken: string;
}
