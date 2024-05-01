import { IsString } from 'class-validator';

export class CreateJobExecutorDto {
  @IsString()
  jobId: string;

  @IsString()
  executorId: string;

  @IsString()
  applicationId: string;
}
