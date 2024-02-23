import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/IsPublic.decorator';
import { EmailVerificationDto } from './dto/emailVerification.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ResetPassworDto } from './dto/resetPassword.dto';
import { PasswordChangingReason } from './enums/PasswordChangingReason.enum';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  @Public()
  async signUp(@Body() createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req) {
    return await this.authService.login(req.user);
  }

  @Get('google/login')
  @Public()
  @UseGuards(GoogleAuthGuard)
  handleLogin() {
    return { msg: 'Google Authentication' };
  }

  @Get('google/redirect')
  @Public()
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(@Req() req: any) {
    return await this.authService.login(req.user);
  }

  @Post('refresh')
  @Public()
  async refreshTokens(@Body() refreshToken: any) {
    return this.authService.refreshTokens(refreshToken.refreshToken);
  }

  @Get('logout')
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.sub);
  }

  @Get('verifyEmail')
  @Public()
  async verifyEmail(@Query() emailVerificationDto: EmailVerificationDto) {
    return await this.authService.verifyEmailCreateUser(emailVerificationDto);
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    return await req.user;
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Query('email') email: string) {
    return await this.authService.SendMailVerifyPassword(
      email,
      PasswordChangingReason.Forgot,
    );
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() resetPass: ResetPassworDto) {
    return await this.authService.verifyEmailAndResetPassword(resetPass);
  }

  @Post('change-password')
  async changePassword(@Req() req: any) {
    return this.authService.SendMailVerifyPassword(
      req.user.email,
      PasswordChangingReason.Proactive,
    );
  }

  // @Post('sendmail')
  // @Public()
  // send() {
  //   return this.authService.sendMail();
  // }

  // @Post('exception')
  // @Public()
  // async testExx() {
  //   return await this.authService.throwEx();
  // }
}
