import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobExecutorService } from './job-executor.service';
import { JobExecutor } from './entities/job-executor.entity';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { CreateJobExecutorDto } from './dto/create-job-executor.dto';
import { SearchingJobExecutorConditionDto } from './dto/job-executor-searching-condition.dto';
import { UpdateJobExecutorDto } from './dto/update-job-executor.dto';

@Controller('job-executor')
export class JobExecutorController {
  constructor(private readonly jobExecutorService: JobExecutorService) {}

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Post()
  async create(@Body() createJobExecutorDto: CreateJobExecutorDto) {
    return await this.jobExecutorService.create(createJobExecutorDto);
  }

  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() searchConditions?: SearchingJobExecutorConditionDto,
  ): Promise<PageDto<JobExecutor>> {
    return await this.jobExecutorService.findAll(
      pageOptionsDto,
      searchConditions,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.jobExecutorService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobExecutorDto: UpdateJobExecutorDto,
  ) {
    return await this.jobExecutorService.update(id, updateJobExecutorDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    console.log(id);
    return await this.jobExecutorService.remove(id);
  }
}
