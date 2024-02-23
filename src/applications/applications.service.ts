import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Application } from './entities/application.entity';
import { Repository } from 'typeorm';
import { SearchingApplicationConditionDto } from './dto/seaching-application-condition.dto';
import { PageMetaDto } from 'src/pagnition/page-meta.dto';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { UsersService } from 'src/users/users.service';
import { JobsService } from 'src/jobs/jobs.service';
import { MailerService } from '@nestjs-modules/mailer';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
    private readonly userService: UsersService,
    private readonly jobService: JobsService,
    private mailerService: MailerService,
  ) {}

  async createApplication(
    createApplicationDto: CreateApplicationDto,
  ): Promise<Application> {
    try {
      const applicant = await this.userService.findOne(
        createApplicationDto.applicantId,
      );
      if (!applicant) {
        throw new NotFoundException('APPLICANT NOT FOUNT');
      }

      const job = await this.jobService.findOne(createApplicationDto.jobId);
      if (!job) {
        throw new NotFoundException('JOB NOT FOUND');
      }

      const newApplication = this.applicationsRepository.create({
        applicant: applicant,
        job: job,
      });

      this.mailerService.sendMail({
        to: job.creator.email,
        from: process.env.MAIL_FROM,
        subject: 'Someone applied your job',
        template: './application/application-created',
        context: {
          applicantName: applicant.fullName,
          jobId: job.id,
          jobTitle: job.title,
        },
      });

      return await this.applicationsRepository.save(newApplication);
    } catch (error) {
      console.error(`Error creating application: ${error.message}`);
      throw new Error('Failed to create application. Please try again.');
    }
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    conditions: SearchingApplicationConditionDto,
  ): Promise<PageDto<Application>> {
    try {
      const queryBuilder = this.applicationsRepository
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.applicant', 'user')
        .leftJoinAndSelect('app.job', 'job')
        .orderBy('app.createdAt', pageOptionsDto.order)
        .skip((pageOptionsDto.page - 1) * pageOptionsDto.take || 0)
        .take(pageOptionsDto.take);

      if (conditions) {
        if (conditions.applicantId) {
          queryBuilder.andWhere('user.id = :applicantId', {
            applicantId: conditions.applicantId,
          });
        }

        if (conditions.jobId) {
          queryBuilder.andWhere('job.id = :jobId', {
            jobId: conditions.jobId,
          });
        }

        if (conditions.status) {
          queryBuilder.andWhere('app.status = :status', {
            status: conditions.status,
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
      console.error('Error retrieving applications:', error);
      throw new Error('Failed to retrieve applications.');
    }
  }

  async findOne(id: string): Promise<Application> {
    try {
      const application = this.applicationsRepository
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.applicant', 'user')
        .leftJoinAndSelect('app.job', 'job')
        .where('app.id = :id', { id })
        .getOne();

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      return application;
    } catch (error) {
      console.error(`Error fetching application: ${error.message}`);
      throw new Error('Failed to fetch application. Please try again.');
    }
  }

  async updateApplication(
    id: string,
    updateData: UpdateApplicationDto,
  ): Promise<Application> {
    try {
      const application = await this.applicationsRepository.findOneBy({ id });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      if (updateData.applicantId) {
        const applicant = await this.userService.findOne(
          updateData.applicantId,
        );
        application.applicant = applicant;
      }

      if (updateData.jobId) {
        const job = await this.jobService.findOne(updateData.jobId);
        application.job = job;
      }

      return await this.applicationsRepository.save(application);
    } catch (error) {
      console.error(`Error updating application: ${error.message}`);
      throw new Error('Failed to update application. Please try again.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.applicationsRepository.delete(id);
    } catch (error) {
      console.error(`Error deleting application: ${error.message}`);
      throw new Error('Failed to delete application. Please try again.');
    }
  }
}
