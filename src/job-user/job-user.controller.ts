import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { JobUserService } from './job-user.service';
import { CreateJobUserDto } from './dto/create-job-user.dto';
import { UpdateJobUserDto } from './dto/update-job-user.dto';
import { SearchingJobUserConditionDto } from './dto/job-user-searching-condition.dto';
import { JobUser } from './entities/job-user.entity';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';

@Controller('job-user')
export class JobUserController {
  constructor(private readonly jobUserService: JobUserService) {}

  @Post()
  async create(@Body() createJobUserDto: CreateJobUserDto) {
    return await this.jobUserService.create(createJobUserDto);
  }

  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() searchConditions?: SearchingJobUserConditionDto,
  ): Promise<PageDto<JobUser>> {
    return await this.jobUserService.findAll(pageOptionsDto, searchConditions);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.jobUserService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobUserDto: UpdateJobUserDto,
  ) {
    return await this.jobUserService.update(id, updateJobUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.jobUserService.remove(id);
  }
}
