import {
  IsBooleanString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserCreator } from 'src/auth/enums/userCreator.enum';

export class SearchingUserConditionDto {
  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsDateString()
  createdAfter: Date;

  @IsOptional()
  @IsBooleanString()
  isVerified: boolean;

  @IsEnum(UserCreator)
  @IsOptional()
  createdBy: UserCreator;

  @IsOptional()
  @IsString()
  phoneNumber: string;
}
