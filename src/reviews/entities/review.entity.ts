import { Job } from 'src/jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ReviewType } from '../enum/review-type.enum';
import { ReviewMedia } from './reviewMedia.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'revieweeId' })
  reviewee: User;

  @Column({ nullable: true })
  content: string;

  @Column()
  rating: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => ReviewMedia, (reviewMedia) => reviewMedia.review, {
    onDelete: 'CASCADE',
  })
  media: ReviewMedia[];

  @Column({
    type: 'enum',
    enum: ReviewType,
  })
  reviewType: ReviewType;
}
