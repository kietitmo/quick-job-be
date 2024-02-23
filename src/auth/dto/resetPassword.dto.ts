import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ResetPassworDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  newPasswordToken: string;

  @IsString()
  newPassword: string;
}
