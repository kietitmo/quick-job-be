import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobUserDto } from './dto/create-job-user.dto';
import { UpdateJobUserDto } from './dto/update-job-user.dto';
import { JobUser } from './entities/job-user.entity';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobsService } from 'src/jobs/jobs.service';
import { MailerService } from '@nestjs-modules/mailer';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { PageMetaDto } from 'src/pagnition/page-meta.dto';
import { SearchingJobUserConditionDto } from './dto/job-user-searching-condition.dto';

@Injectable()
export class JobUserService {
  constructor(
    @InjectRepository(JobUser)
    private readonly jobUserRepository: Repository<JobUser>,
    private userService: UsersService,
    private jobService: JobsService,
    private mailerService: MailerService,
  ) {}

  async create(createJobUserDto: CreateJobUserDto) {
    try {
      const executor = await this.userService.findOne(createJobUserDto.userId);
      const job = await this.jobService.findOne(createJobUserDto.jobId);

      if (!executor && !job) {
        throw new NotFoundException('User or job not found');
      }
      const jobUser = new JobUser();
      jobUser.executor = executor;
      jobUser.job = job;

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

      return await this.jobUserRepository.save(jobUser);
    } catch (error) {
      console.error('Create job user error:', error);
      throw new Error('Failed to create job user.');
    }
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    conditions: SearchingJobUserConditionDto,
  ): Promise<PageDto<JobUser>> {
    try {
      const queryBuilder = this.jobUserRepository
        .createQueryBuilder('job_user')
        .leftJoinAndSelect('job_user.job', 'jobs')
        .leftJoinAndSelect('job_user.executor', 'users')
        .orderBy('job_user.createdAt', pageOptionsDto.order)
        .skip((pageOptionsDto.page - 1) * pageOptionsDto.take || 0)
        .take(pageOptionsDto.take);
      if (conditions) {
        if (conditions.executorId) {
          queryBuilder.andWhere('users.id = :executorId', {
            executorId: conditions.executorId,
          });
        }

        if (conditions.jobId) {
          queryBuilder.andWhere('jobs.id = :jobId', {
            jobId: conditions.jobId,
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
      return await this.jobUserRepository
        .createQueryBuilder('job_user')
        .leftJoinAndSelect('job_user.job', 'jobs')
        .leftJoinAndSelect('job_user.executor', 'users')
        .where('job_user.id = :id', { id })
        .getOne();
    } catch (error) {
      console.error('Find one job user error:', error);
      throw new Error('Failed to find job user.');
    }
  }

  async update(id: string, updateJobUserDto: UpdateJobUserDto) {
    try {
      const jobUser = await this.jobUserRepository
        .createQueryBuilder('job_user')
        .where('job_user.id = :id', { id })
        .leftJoinAndSelect('job_user.job', 'jobs')
        .leftJoinAndSelect('job_user.executor', 'users')
        .getOne();

      if (!jobUser) {
        throw new NotFoundException('Job user not found');
      }

      if (updateJobUserDto.jobId) {
        const newJob = await this.jobService.findOne(updateJobUserDto.jobId);
        jobUser.job = newJob;
      }

      if (updateJobUserDto.userId) {
        const newExecutor = await this.userService.findOne(
          updateJobUserDto.userId,
        );
        jobUser.executor = newExecutor;
      }

      await this.jobUserRepository.save(jobUser);
      return jobUser;
    } catch (error) {
      console.error('Update job user error:', error);
      throw new Error('Failed to update job user.');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.jobUserRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('Job user not found');
      }
    } catch (error) {
      console.error('Remove job user error:', error);
      throw new Error('Failed to remove job user.');
    }
  }
}
