import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job } from './entities/job.entity';
// import { JobImage } from './entities/job_image.entity';
// import { JobVideo } from './entities/job_video.entity';
import { AddressVietNamService } from 'src/address/vietnamAdress/addressVietnam.service';
import { JobAddress } from '../address/jobAddress/entities/jobAddress.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { PageMetaDto } from 'src/pagnition/page-meta.dto';
import { SearchingJobConditionDto } from './dto/search-condition.dto';
import { UsersService } from 'src/users/users.service';
import { JobMedia } from './entities/job_media.entity';
import { JobMediaType } from './enums/job-media-type.enum';

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private readonly jobsRepository: Repository<Job>,
    @InjectRepository(JobMedia)
    private readonly jobMediaRepository: Repository<JobMedia>,
    // @InjectRepository(JobImage)
    // private readonly jobImageRepository: Repository<JobImage>,
    // @InjectRepository(JobVideo)
    // private readonly jobVideoRepository: Repository<JobVideo>,
    @InjectRepository(JobAddress)
    private readonly jobAddressRepository: Repository<JobAddress>,
    private readonly vietnamAddressService: AddressVietNamService,
    private readonly userService: UsersService,
  ) {}

  async createJob(
    createJobDto: CreateJobDto,
    files?: Array<Express.Multer.File>,
  ): Promise<Job> {
    try {
      const { creatorId, address, ...jobData } = createJobDto;
      const province = await this.vietnamAddressService.getProvince(
        address.province_code,
      );
      const district = await this.vietnamAddressService.getDistrict(
        address.district_code,
      );
      const ward = await this.vietnamAddressService.getWard(address.ward_code);

      const jobAddress = this.jobAddressRepository.create({
        province: province,
        district: district,
        ward: ward,
        street: address.street,
        houseNumber: address.houseNumber,
      });
      const savedJobAddress = await this.jobAddressRepository.save(jobAddress);
      const user = await this.userService.findOne(creatorId);

      const newJob = this.jobsRepository.create({
        ...jobData,
        address: savedJobAddress,
        creator: user,
      });
      const savedJob = await this.jobsRepository.save(newJob);
      savedJobAddress.job = savedJob;
      await this.jobAddressRepository.save(savedJobAddress);
      if (files) {
        files.forEach(async (file) => {
          const jobmedia = new JobMedia();
          jobmedia.job = savedJob;

          if (file.mimetype.startsWith('image')) {
            // const jobImage = new JobImage();
            // jobImage.url = '/uploads/job/images/' + file.filename;
            // jobImage.job = savedJob;
            // await this.jobImageRepository.save(jobImage);

            jobmedia.mediaType = JobMediaType.IMAGE;
            jobmedia.url = '/uploads/job/images/' + file.filename;
            await this.jobMediaRepository.save(jobmedia);
          }
          if (file.mimetype.startsWith('video')) {
            // const jobVideo = new JobVideo();
            // jobVideo.url = '/uploads/job/videos/' + file.filename;
            // jobVideo.job = savedJob;
            // await this.jobVideoRepository.save(jobVideo);

            jobmedia.mediaType = JobMediaType.IMAGE;
            jobmedia.url = '/uploads/job/videos/' + file.filename;
            await this.jobMediaRepository.save(jobmedia);
          }
        });
      }

      return await this.jobsRepository.save(savedJob);
    } catch (error) {
      console.error('Error creating job:', error);
      throw new Error('Failed to create job.');
    }
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    conditions: SearchingJobConditionDto,
  ): Promise<PageDto<Job>> {
    try {
      const queryBuilder = this.jobsRepository
        .createQueryBuilder('job')
        .orderBy('job.postedTime', pageOptionsDto.order)
        .skip((pageOptionsDto.page - 1) * pageOptionsDto.take || 0)
        .take(pageOptionsDto.take)
        .leftJoinAndSelect('job.address', 'address')
        .leftJoinAndSelect('job.media', 'media_media')
        .leftJoinAndSelect('job.creator', 'creator')
        .leftJoinAndSelect('job.applications', 'applications')
        .leftJoinAndSelect('address.province', 'province')
        .leftJoinAndSelect('address.district', 'district')
        .leftJoinAndSelect('address.ward', 'ward');

      if (conditions) {
        if (conditions.creatorId) {
          queryBuilder.andWhere('creator.id = :creatorId', {
            creatorId: conditions.creatorId,
          });
        }

        if (conditions.status) {
          queryBuilder.andWhere('job.status = :status', {
            status: conditions.status,
          });
        }

        if (conditions.province_code) {
          queryBuilder.andWhere('province.code = :province_code', {
            province_code: conditions.province_code,
          });
        }

        if (conditions.district_code) {
          queryBuilder.andWhere('district.code = :district_code', {
            district_code: conditions.district_code,
          });
        }

        if (conditions.ward_code) {
          queryBuilder.andWhere('ward.code LIKE :ward_code', {
            ward_code: conditions.ward_code,
          });
        }

        if (conditions.address_street) {
          queryBuilder.andWhere('address.street LIKE :street', {
            street: `%${conditions.address_street}%`,
          });
        }

        if (conditions.address_houseNumber) {
          queryBuilder.andWhere('address.houseNumber LIKE :houseNumber', {
            houseNumber: `%${conditions.address_houseNumber}%`,
          });
        }

        if (conditions.startTime) {
          queryBuilder.andWhere('job.startTime >= :startTime', {
            startTime: conditions.startTime,
          });
        }

        if (conditions.endTime) {
          queryBuilder.andWhere('job.endTime <= :endTime', {
            endTime: conditions.endTime,
          });
        }

        if (conditions.title) {
          queryBuilder.andWhere('job.title LIKE :title', {
            title: `%${conditions.title}%`,
          });
        }

        if (conditions.minSalary) {
          queryBuilder.andWhere('job.salaryOrFee >= :minSalary', {
            minSalary: conditions.minSalary,
          });
        }

        if (conditions.maxSalary) {
          queryBuilder.andWhere('job.salaryOrFee <= :maxSalary', {
            maxSalary: conditions.maxSalary,
          });
        }
      }

      const [res, total] = await queryBuilder.getManyAndCount();

      const itemCount = total;

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

      return new PageDto(res, pageMetaDto);
    } catch (error) {
      console.error('Error retrieving jobs:', error);
      throw new Error('Failed to retrieve jobs.');
    }
  }

  async findOne(id: string): Promise<Job | null> {
    try {
      return await this.jobsRepository
        .createQueryBuilder('job')
        .where('job.id = :id', { id: id })
        .leftJoinAndSelect('job.address', 'address')
        .leftJoinAndSelect('job.media', 'media_media')

        .leftJoinAndSelect('job.creator', 'creator')
        .leftJoinAndSelect('address.province', 'province')
        .leftJoinAndSelect('address.district', 'district')
        .leftJoinAndSelect('address.ward', 'ward')
        .getOne();
    } catch (error) {
      console.error('Error retrieving job:', error);
      throw new Error('Failed to retrieve job.');
    }
  }

  async updateJob(
    id: string,
    updateJobDto: UpdateJobDto,
    files?: Array<Express.Multer.File>,
  ): Promise<Job> {
    try {
      const job = await this.jobsRepository
        .createQueryBuilder('job')
        .where('job.id = :id', { id })
        .leftJoinAndSelect('job.address', 'address')
        .leftJoinAndSelect('job.creator', 'creator')
        .leftJoinAndSelect('job.media', 'media')
        .getOne();

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      if (updateJobDto.creatorId) {
        const user = await this.userService.findOne(updateJobDto.creatorId);
        if (user) {
          job.creator = user;
        }
      }

      if (updateJobDto.title) {
        job.title = updateJobDto.title;
      }

      if (updateJobDto.description) {
        job.description = updateJobDto.description;
      }

      if (updateJobDto.startTime) {
        job.startTime = updateJobDto.startTime;
      }

      if (updateJobDto.endTime) {
        job.endTime = updateJobDto.endTime;
      }

      if (updateJobDto.salaryOrFee) {
        job.salaryOrFee = updateJobDto.salaryOrFee;
      }

      if (updateJobDto.category) {
        job.category = updateJobDto.category;
      }

      if (updateJobDto.rating) {
        job.rating = updateJobDto.rating;
      }

      if (updateJobDto.status) {
        job.status = updateJobDto.status;
      }

      if (files) {
        if (job.media) {
          job.media.forEach((x) => this.removeJobMedia(x.id));
        }

        if (files) {
          files.forEach(async (file) => {
            const jobmedia = new JobMedia();
            jobmedia.job = job;

            if (file.mimetype.startsWith('image')) {
              // const jobImage = new JobImage();
              // jobImage.url = '/uploads/job/images/' + file.filename;
              // jobImage.job = job;
              // await this.jobImageRepository.save(jobImage);

              jobmedia.mediaType = JobMediaType.IMAGE;
              jobmedia.url = '/uploads/job/images/' + file.filename;
              await this.jobMediaRepository.save(jobmedia);
            }

            if (file.mimetype.startsWith('video')) {
              // const jobVideo = new JobVideo();
              // jobVideo.url = '/uploads/job/videos/' + file.filename;
              // jobVideo.job = job;
              // await this.jobVideoRepository.save(jobVideo);

              jobmedia.mediaType = JobMediaType.IMAGE;
              jobmedia.url = '/uploads/job/videos/' + file.filename;
              await this.jobMediaRepository.save(jobmedia);
            }
          });
        }
      }

      const address = await this.jobAddressRepository
        .createQueryBuilder('jobAddresses')
        .where('jobAddresses.id = :addressId', { addressId: job.address.id })
        .getOne();

      if (updateJobDto.address) {
        if (updateJobDto.address.province_code) {
          address.province = await this.vietnamAddressService.getProvince(
            updateJobDto.address.province_code,
          );
        }

        if (updateJobDto.address.district_code) {
          address.district = await this.vietnamAddressService.getDistrict(
            updateJobDto.address.district_code,
          );
        }

        if (updateJobDto.address.ward_code) {
          address.ward = await this.vietnamAddressService.getWard(
            updateJobDto.address.ward_code,
          );
        }

        if (updateJobDto.address.street) {
          address.street = updateJobDto.address.street;
        }

        if (updateJobDto.address.houseNumber) {
          address.houseNumber = updateJobDto.address.houseNumber;
        }

        this.jobAddressRepository.save(address);
      }

      return this.jobsRepository.save(job);
    } catch (error) {
      console.error('Error updating job:', error);
      throw new Error('Failed to update job.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const job = await this.jobsRepository.findOneBy({ id });

      if (!job) {
        throw new NotFoundException('Job not found');
      }

      await this.jobsRepository.delete(id);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw new Error('Failed to delete job.');
    }
  }

  async findJobsByConditions(conditions: any): Promise<Job[]> {
    try {
      const queryBuilder = this.jobsRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.address', 'address')
        .leftJoinAndSelect('job.images', 'images')
        .leftJoinAndSelect('job.media', 'job_media')
        .leftJoinAndSelect('job.videos', 'videos')
        .leftJoinAndSelect('job.creator', 'creator')
        .leftJoinAndSelect('address.province', 'province')
        .leftJoinAndSelect('address.district', 'district')
        .leftJoinAndSelect('address.ward', 'ward');

      if (conditions.province_code) {
        queryBuilder.andWhere('province.code = :province_code', {
          province_code: conditions.province_code,
        });
      }

      if (conditions.district_code) {
        queryBuilder.andWhere('district.code = :district_code', {
          district_code: conditions.district_code,
        });
      }

      if (conditions.ward_code) {
        queryBuilder.andWhere('ward.code LIKE :ward_code', {
          ward_code: conditions.ward_code,
        });
      }

      if (conditions.address_street) {
        queryBuilder.andWhere('address.street LIKE :street', {
          street: `%${conditions.address_street}%`,
        });
      }

      if (conditions.address_houseNumber) {
        queryBuilder.andWhere('address.houseNumber LIKE :houseNumber', {
          houseNumber: `%${conditions.address_houseNumber}%`,
        });
      }

      if (conditions.startTime) {
        queryBuilder.andWhere('job.startTime >= :startTime', {
          startTime: conditions.startTime,
        });
      }

      if (conditions.endTime) {
        queryBuilder.andWhere('job.endTime <= :endTime', {
          endTime: conditions.endTime,
        });
      }

      if (conditions.title) {
        queryBuilder.andWhere('job.title LIKE :title', {
          title: `%${conditions.title}%`,
        });
      }

      if (conditions.minSalary) {
        queryBuilder.andWhere('job.salaryOrFee >= :minSalary', {
          minSalary: conditions.minSalary,
        });
      }

      if (conditions.maxSalary) {
        queryBuilder.andWhere('job.salaryOrFee <= :maxSalary', {
          maxSalary: conditions.maxSalary,
        });
      }
      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error finding jobs by conditions:', error);
      throw new Error('Failed to find jobs by conditions.');
    }
  }

  async addJobMedia(jobId: string, files: Array<Express.Multer.File>) {
    try {
      if (!files) {
        throw new NotFoundException('NOT FOUND FILES TO ADD MEDIA');
      }
      const job = await this.jobsRepository.findOneBy({ id: jobId });

      if (!job) {
        throw new NotFoundException('NOT FOUND JOB TO ADD MEDIA');
      }

      files.forEach(async (file) => {
        const jobmedia = new JobMedia();
        jobmedia.job = job;

        if (file.mimetype.startsWith('image')) {
          // const jobImage = new JobImage();
          // jobImage.url = '/uploads/job/images/' + file.filename;
          // jobImage.job = job;
          // await this.jobImageRepository.save(jobImage);

          jobmedia.mediaType = JobMediaType.IMAGE;
          jobmedia.url = '/uploads/job/images/' + file.filename;
          await this.jobMediaRepository.save(jobmedia);
        }

        if (file.mimetype.startsWith('video')) {
          // const jobVideo = new JobVideo();
          // jobVideo.url = '/uploads/job/videos/' + file.filename;
          // jobVideo.job = job;
          // await this.jobVideoRepository.save(jobVideo);

          jobmedia.mediaType = JobMediaType.IMAGE;
          jobmedia.url = '/uploads/job/videos/' + file.filename;
          await this.jobMediaRepository.save(jobmedia);
        }
      });

      return await this.jobsRepository.save(job);
    } catch (error) {
      console.error('Error adding job media:', error);
      throw new Error('Failed to add job media.');
    }
  }

  // async removeJobImage(id: string): Promise<void> {
  //   try {
  //     const job = await this.jobImageRepository.findOneBy({ id });

  //     if (!job) {
  //       throw new NotFoundException('Job Image not found');
  //     }

  //     await this.jobImageRepository.delete(id);
  //   } catch (error) {
  //     console.error('Error deleting job Image:', error);
  //     throw new Error('Failed to delete job Image.');
  //   }
  // }

  async removeJobMedia(id: string): Promise<void> {
    try {
      const job = await this.jobMediaRepository.findOneBy({ id });

      if (!job) {
        throw new NotFoundException('Job media not found');
      }

      await this.jobMediaRepository.delete(id);
    } catch (error) {
      console.error('Error deleting job media:', error);
      throw new Error('Failed to delete job media.');
    }
  }

  // async removeJobVideo(id: string): Promise<void> {
  //   try {
  //     const job = await this.jobVideoRepository.findOneBy({ id });

  //     if (!job) {
  //       throw new NotFoundException('Job Video not found');
  //     }

  //     await this.jobVideoRepository.delete(id);
  //   } catch (error) {
  //     console.error('Error deleting job Video:', error);
  //     throw new Error('Failed to delete job Video.');
  //   }
  // }
}
