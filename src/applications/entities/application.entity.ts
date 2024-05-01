import { Job } from 'src/jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ApplicationStatus } from '../enums/application-status.enum';

@Unique(['job', 'applicant'])
@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'applicantId' })
  applicant: User;

  @ManyToOne(() => Job)
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.ACTIVE,
  })
  status: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
