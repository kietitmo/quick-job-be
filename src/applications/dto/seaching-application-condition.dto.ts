import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../enums/application-status.enum';

export class SearchingApplicationConditionDto {
  @IsOptional()
  @IsString()
  applicantId: string;

  @IsOptional()
  @IsString()
  jobId: string;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status: ApplicationStatus;

  @IsOptional()
  @IsDateString()
  createdAfter: Date;
}
