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
  UseGuards,
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
import { JobCategory } from './enums/JobCategory.enum';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}
  @Get('category')
  async getCategory() {
    return JobCategory;
  }

  @Public()
  @Get('search')
  async searchJobs(@Query() conditions: any) {
    const foundJobs = await this.jobsService.findJobsByConditions(conditions);
    return foundJobs;
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
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

  @UseGuards(JwtAuthGuard, RoleGuard)
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

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.jobsService.remove(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
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
