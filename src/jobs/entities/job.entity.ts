import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { JobImage } from './job_image.entity';
import { JobVideo } from './job_video.entity';
import { JobCategory } from '../enums/JobCategory.enum';
import { JobStatus } from '../enums/JobStatus.enum';
import { JobAddress } from '../../address/jobAddress/entities/jobAddress.entity';

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  // @Column()
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: 1 })
  quantityUserNeeded: number;

  @OneToOne(() => JobAddress, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'addressId' })
  address: JobAddress;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  startTime: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  endTime: Date;

  @Column()
  salaryOrFee: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  postedTime: Date;

  @Column({
    type: 'enum',
    enum: JobCategory,
    default: JobCategory.None,
  })
  category: JobCategory;

  @OneToMany(() => JobImage, (jobImage) => jobImage.job, {
    onDelete: 'CASCADE',
  })
  images: JobImage[];

  @OneToMany(() => JobVideo, (jobVideo) => jobVideo.job, {
    onDelete: 'CASCADE',
  })
  videos: JobVideo[];

  @Column({ nullable: true })
  rating: number;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.Searching,
  })
  status: JobStatus;
}
