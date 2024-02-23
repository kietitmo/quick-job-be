import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Job } from './job.entity';

@Entity('job_images')
export class JobImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Job, (job) => job.images)
  job: Job;
}
