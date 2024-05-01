import { PartialType } from '@nestjs/mapped-types';
import { CreateJobExecutorDto } from './create-job-executor.dto';

export class UpdateJobExecutorDto extends PartialType(CreateJobExecutorDto) {}
