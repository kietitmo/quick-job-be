import {
  IsAlphanumeric,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserCreator } from 'src/auth/enums/userCreator.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsAlphanumeric()
  phoneNumber: string;

  @IsOptional()
  refreshToken: string;

  @IsOptional()
  @IsBoolean()
  isVerified: boolean;

  @IsEnum(UserCreator)
  @IsOptional()
  createdBy: UserCreator;

  @IsString()
  @IsOptional()
  avatarUrl: string;
}
