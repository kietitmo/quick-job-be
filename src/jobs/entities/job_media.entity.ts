import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { JobMediaType } from '../enums/job-media-type.enum';
import { Job } from './job.entity';

@Entity('job_media')
export class JobMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: JobMediaType })
  mediaType: JobMediaType;

  @ManyToOne(() => Job, (job) => job.media, { onDelete: 'CASCADE' })
  job: Job;
}
