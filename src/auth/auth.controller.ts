import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { Public } from './decorators/IsPublic.decorator';
import { EmailVerificationDto } from './dto/emailVerification.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ResetPassworDto } from './dto/resetPassword.dto';
import { PasswordChangingReason } from './enums/PasswordChangingReason.enum';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailChangingDto } from './dto/emailChanging.dto';

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
  @UseGuards(GoogleAuthGuard)
  async handleRedirect(@Req() req: any, @Res() res: Response) {
    const auth = await this.authService.login(req.user);
    res.cookie('auth', JSON.stringify(auth));
    return res.redirect('http://localhost:3000/login');
  }

  @Post('refresh')
  @Public()
  async refreshTokens(@Body() refreshToken: any) {
    return this.authService.refreshTokens(refreshToken.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);
  }

  @Post('verifyEmail')
  @Public()
  async verifyEmail(@Body() emailVerificationDto: EmailVerificationDto) {
    return await this.authService.verifyEmailCreateUser(emailVerificationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    return await req.user;
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    console.log(email);
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

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any) {
    console.log(req);
    return this.authService.SendMailVerifyPassword(
      req.user.email,
      PasswordChangingReason.Proactive,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-Email')
  async changeEmail(@Body() { newEmail }, @Req() req: any) {
    return await this.authService.changeEmail(newEmail, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-change-Email')
  async VerifyChangeEmail(@Body() emailChanging: EmailChangingDto) {
    return await this.authService.verifyEmailChanging(emailChanging);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel-change-Email')
  async CancelChangeEmail(@Req() req: any) {
    return await this.authService.cancelEmailChanging(req.user.id);
  }

  @Get('sendmailtest')
  async mail() {
    return this.authService.sendMail('email_test4@mailinator.com');
  }
}
