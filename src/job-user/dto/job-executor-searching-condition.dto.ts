import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SearchingJobExecutorConditionDto {
  @IsOptional()
  @IsString()
  executorId: string;

  @IsOptional()
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
  applicationId: string;

  @IsOptional()
  @IsDateString()
  createdAfter: Date;
}
