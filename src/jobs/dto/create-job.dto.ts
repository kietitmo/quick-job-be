import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { JobStatus } from '../enums/JobStatus.enum';
import { JobCategory } from '../enums/JobCategory.enum';
import { JobAddressDto } from '../../address/jobAddress/dto/jobAddress.dto';
import { Type } from 'class-transformer';

export class CreateJobDto {
  @IsString()
  creatorId: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsObject()
  @Type(() => JobAddressDto)
  address: JobAddressDto;

  @IsDateString()
  startTime: Date;

  @IsDateString()
  endTime: Date;

  @IsNumberString()
  quantityUserNeeded: number;

  @IsNumberString()
  salaryOrFee: number;

  @IsEnum(JobCategory)
  @IsOptional()
  category: JobCategory;

  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'Rating must be at least 0' })
  @Max(5, { message: 'Rating must not exceed 5' })
  rating: number;

  @IsEnum(JobStatus)
  @IsOptional()
  status: JobStatus;
}
