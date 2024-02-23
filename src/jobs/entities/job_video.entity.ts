import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Job } from './job.entity';

@Entity('job_videos')
export class JobVideo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  videoUrl: string;

  @ManyToOne(() => Job, (job) => job.videos)
  job: Job;
}
