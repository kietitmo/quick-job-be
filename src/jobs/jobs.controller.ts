import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public } from 'src/auth/decorators/IsPublic.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CustomStorageJobMedia } from './file-upload-config/storage-upload-config';
import { Job } from './entities/job.entity';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { SearchingJobConditionDto } from './dto/search-condition.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  @Public()
  @Get('search')
  async searchJobs(@Query() conditions: any) {
    const foundJobs = await this.jobsService.findJobsByConditions(conditions);
    return foundJobs;
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', null, CustomStorageJobMedia))
  async create(
    @Body() createJobDto: CreateJobDto,
    @UploadedFiles()
    files?: Array<Express.Multer.File>,
  ) {
    return await this.jobsService.createJob(createJobDto, files);
  }

  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() searchConditions?: SearchingJobConditionDto,
  ): Promise<PageDto<Job>> {
    return await this.jobsService.findAll(pageOptionsDto, searchConditions);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.jobsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', null, CustomStorageJobMedia))
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
    @UploadedFiles()
    files?: Array<Express.Multer.File>,
  ) {
    return await this.jobsService.updateJob(id, updateJobDto, files);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.jobsService.remove(id);
  }

  @Post('upload-media')
  @UseInterceptors(FilesInterceptor('files', null, CustomStorageJobMedia))
  async uploadFiles(
    @Body('jobId') jobId: string,
    @UploadedFiles()
    files?: Array<Express.Multer.File>,
  ) {
    return this.jobsService.addJobMedia(jobId, files);
  }
}
