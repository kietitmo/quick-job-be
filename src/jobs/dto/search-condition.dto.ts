import { IsOptional, IsString } from 'class-validator';

export class SearchingJobConditionDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  creatorId: string;

  @IsString()
  @IsOptional()
  province_code: string;

  @IsString()
  @IsOptional()
  district_code: string;

  @IsString()
  @IsOptional()
  ward_code: string;

  @IsString()
  @IsOptional()
  address_street: string;

  @IsString()
  @IsOptional()
  address_houseNumber: string;

  @IsString()
  @IsOptional()
  startTime: string;

  @IsString()
  @IsOptional()
  endTime: string;

  @IsString()
  @IsOptional()
  minSalary: string;

  @IsString()
  @IsOptional()
  maxSalary: string;

  @IsString()
  @IsOptional()
  status: string;
}
