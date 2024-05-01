import { Injectable, NotFoundException } from '@nestjs/common';
import { JobExecutor } from './entities/job-executor.entity';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from 'src/jobs/jobs.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { PageMetaDto } from 'src/pagnition/page-meta.dto';
import { ApplicationsService } from 'src/applications/applications.service';
import { SearchingJobExecutorConditionDto } from './dto/job-executor-searching-condition.dto';
import { CreateJobExecutorDto } from './dto/create-job-executor.dto';
import { UpdateJobExecutorDto } from './dto/update-job-executor.dto';

@Injectable()
export class JobExecutorService {
  constructor(
    @InjectRepository(JobExecutor)
    private readonly jobExecutorRepository: Repository<JobExecutor>,
    private userService: UsersService,
    private jobService: JobsService,
    private applicationService: ApplicationsService,
    private mailerService: MailerService,
  ) {}

  async create(createJobExecutorDto: CreateJobExecutorDto) {
    try {
      const executor = await this.userService.findOne(
        createJobExecutorDto.executorId,
      );
      const job = await this.jobService.findOne(createJobExecutorDto.jobId);
      const app = await this.applicationService.findOne(
        createJobExecutorDto.applicationId,
      );
      if (!executor || !job || !app) {
        throw new NotFoundException('executor or job or application not found');
      }
      const jobExecutor = new JobExecutor();
      jobExecutor.executor = executor;
      jobExecutor.job = job;
      jobExecutor.application = app;

      this.mailerService.sendMail({
        to: executor.email,
        from: process.env.MAIL_FROM,
        subject: 'Your application is accepted',
        template: './job-user/send-accepted-mail',
        context: {
          applicantName: executor.fullName,
          jobId: job.id,
          jobTitle: job.title,
        },
      });

      return await this.jobExecutorRepository.save(jobExecutor);
    } catch (error) {
      console.error('Create job user error:', error);
      throw new Error('Failed to create job user.');
    }
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    conditions: SearchingJobExecutorConditionDto,
  ): Promise<PageDto<JobExecutor>> {
    try {
      const queryBuilder = this.jobExecutorRepository
        .createQueryBuilder('job_user')
        .leftJoinAndSelect('job_user.job', 'jobs')
        .leftJoinAndSelect('jobs.creator', 'creator')
        .leftJoinAndSelect('job_user.application', 'applications')
        .leftJoinAndSelect('job_user.executor', 'executor')
        .orderBy('job_user.createdAt', pageOptionsDto.order)
        .skip((pageOptionsDto.page - 1) * pageOptionsDto.take || 0)
        .take(pageOptionsDto.take);
      if (conditions) {
        if (conditions.executorId) {
          queryBuilder.andWhere('executor.id = :executorId', {
            executorId: conditions.executorId,
          });
        }

        if (conditions.jobId) {
          queryBuilder.andWhere('jobs.id = :jobId', {
            jobId: conditions.jobId,
          });
        }

        if (conditions.applicationId) {
          queryBuilder.andWhere('applications.id = :applicationId', {
            applicationId: conditions.applicationId,
          });
        }

        if (conditions.createdAfter) {
          queryBuilder.andWhere('app.createdAt >= :createdAfter', {
            createdAfter: conditions.createdAfter,
          });
        }
      }

      const [res, total] = await queryBuilder.getManyAndCount();

      const itemCount = total;

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

      return new PageDto(res, pageMetaDto);
    } catch (error) {
      console.error('Find all job users error:', error);
      throw new Error('Failed to find all job users.');
    }
  }

  async findOne(id: string) {
    try {
      return await this.jobExecutorRepository
        .createQueryBuilder('job_user')
        .leftJoinAndSelect('job_user.job', 'jobs')
        .leftJoinAndSelect('jobs.creator', 'creator')
        .leftJoinAndSelect('job_user.application', 'applications')
        .leftJoinAndSelect('job_user.executor', 'executor')
        .where('job_user.id = :id', { id })
        .getOne();
    } catch (error) {
      console.error('Find one job user error:', error);
      throw new Error('Failed to find job user.');
    }
  }

  async update(id: string, updateJobExecutorDto: UpdateJobExecutorDto) {
    try {
      const jobExecutor = await this.jobExecutorRepository
        .createQueryBuilder('job_user')
        .where('job_user.id = :id', { id })
        .leftJoinAndSelect('job_user.job', 'jobs')
        .leftJoinAndSelect('jobs.creator', 'creator')
        .leftJoinAndSelect('job_user.application', 'applications')
        .leftJoinAndSelect('job_user.executor', 'executor')
        .getOne();

      if (!jobExecutor) {
        throw new NotFoundException('Job user not found');
      }

      if (updateJobExecutorDto.jobId) {
        const newJob = await this.jobService.findOne(
          updateJobExecutorDto.jobId,
        );
        jobExecutor.job = newJob;
      }

      if (updateJobExecutorDto.executorId) {
        const newExecutor = await this.userService.findOne(
          updateJobExecutorDto.executorId,
        );
        jobExecutor.executor = newExecutor;
      }

      if (updateJobExecutorDto.applicationId) {
        const newApp = await this.applicationService.findOne(
          updateJobExecutorDto.applicationId,
        );
        jobExecutor.application = newApp;
      }

      await this.jobExecutorRepository.save(jobExecutor);
      return jobExecutor;
    } catch (error) {
      console.error('Update job user error:', error);
      throw new Error('Failed to update job user.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.jobExecutorRepository.delete(id);
    } catch (error) {
      console.error('Remove job user error:', error);
      throw new Error('Failed to remove job user.');
    }
  }
}
