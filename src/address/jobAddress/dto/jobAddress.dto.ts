import { IsString } from 'class-validator';

export class JobAddressDto {
  @IsString()
  province_code: string;

  @IsString()
  district_code: string;

  @IsString()
  ward_code: string;

  @IsString()
  street: string;

  @IsString()
  houseNumber: string;
}
