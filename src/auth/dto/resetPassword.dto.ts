import { IsOptional, IsString } from 'class-validator';

export class ResetPassworDto {
  email: string;

  @IsString()
  @IsOptional()
  newPasswordToken: string;

  @IsString()
  newPassword: string;
}
