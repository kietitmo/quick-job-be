import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SearchingJobUserConditionDto {
  @IsOptional()
  @IsString()
  executorId: string;

  @IsOptional()
  @IsString()
  jobId: string;

  @IsOptional()
  @IsDateString()
  createdAfter: Date;
}
