import { PartialType } from '@nestjs/mapped-types';
import { CreateJobUserDto } from './create-job-user.dto';

export class UpdateJobUserDto extends PartialType(CreateJobUserDto) {}
