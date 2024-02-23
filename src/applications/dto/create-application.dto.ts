import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../enums/application-status.enum';

export class CreateApplicationDto {
  @IsString()
  applicantId: string;

  @IsString()
  jobId: string;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status: ApplicationStatus;
}
