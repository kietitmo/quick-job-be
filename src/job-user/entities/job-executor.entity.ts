import { Application } from 'src/applications/entities/application.entity';
import { Job } from 'src/jobs/entities/job.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['job', 'executor'])
export class JobExecutor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'executor_id' })
  executor: User;

  @OneToOne(() => Application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
