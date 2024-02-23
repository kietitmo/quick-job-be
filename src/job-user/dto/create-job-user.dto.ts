import { IsString } from 'class-validator';

export class CreateJobUserDto {
  @IsString()
  jobId: string;

  @IsString()
  userId: string;
}
