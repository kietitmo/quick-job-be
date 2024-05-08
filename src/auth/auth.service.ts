import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from './entities/emailVerification.entity';
import * as crypto from 'crypto';
import { EmailVerificationDto } from './dto/emailVerification.dto';
import { User } from 'src/users/entities/user.entity';
import { ResetPassworDto } from './dto/resetPassword.dto';
import { PasswordChangingReason } from './enums/PasswordChangingReason.enum';
import { ChangingPassword } from './entities/changingPassword.entity';
import { Profile } from 'passport-google-oauth20';
import { UserCreator } from './enums/userCreator.enum';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { Token } from './entities/token.entity';
import { TokenService } from './token.service';
import { EmailChangingDto } from './dto/emailChanging.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private tokenService: TokenService,

    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,

    @InjectRepository(ChangingPassword)
    private forgottenPasswordRepository: Repository<ChangingPassword>,

    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    try {
      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_ACCESS_TOKEN,
        expiresIn: '300s',
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_REFRESH_TOKEN,
        expiresIn: '15d',
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  async signUp(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.usersService.createUser(createUserDto);

      const randomBytes = crypto.randomBytes(6);
      const token = randomBytes.toString('hex').slice(0, 6);

      const emailVerification = this.emailVerificationRepository.create({
        user: user,
        emailToken: token,
      });

      this.emailVerificationRepository.save(emailVerification);
      this.mailerService.sendMail({
        to: createUserDto.email,
        from: process.env.MAIL_FROM,
        subject: 'Welcome to Quick Job ✔',
        template: './auth/welcome',
        context: {
          name: createUserDto.fullName,
          token: token,
          email: createUserDto.email,
        },
      });
      console.log('send mail');
      await this.usersService.updateUser(user.id, {
        createdBy: UserCreator.local,
      });
      await this.tokenService.createToken(user.id, '-');

      return user;
    } catch (error) {
      throw error;
    }
  }

  async changeEmail(newEmail: string, userId: string) {
    try {
      const randomBytes = crypto.randomBytes(6);
      const token = randomBytes.toString('hex').slice(0, 6);
      const user = await this.usersService.findOne(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const emailVerification = this.emailVerificationRepository.create({
        user: user,
        emailToken: token,
      });

      this.emailVerificationRepository.save(emailVerification);

      this.mailerService.sendMail({
        to: newEmail,
        from: process.env.MAIL_FROM,
        subject: 'Changing email in Quick Job ✔',
        template: './auth/emailChanging',
        context: {
          token: token,
        },
      });
    } catch (error) {
      console.error('Email changing error:', error);
      throw error;
    }
  }
  async cancelEmailChanging(userId: string) {
    try {
      const emailVerification = await this.emailVerificationRepository
        .createQueryBuilder('emailVeri')
        .leftJoinAndSelect('emailVeri.user', 'user')
        .where('user.id = :userId', { userId: userId })
        .getOne();

      if (!emailVerification) {
        throw new NotFoundException('Email Verification not found');
      }

      this.emailVerificationRepository.remove(emailVerification);
      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async verifyEmailChanging(emailChangingDto: EmailChangingDto) {
    try {
      const emailVerification = await this.emailVerificationRepository.findOne({
        where: {
          emailToken: emailChangingDto.emailToken,
        },
      });

      if (!emailVerification) {
        throw new NotFoundException('Email Verification not found');
      }

      const user = await this.usersService.findOneByEmail(
        emailChangingDto.currentEmail,
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.usersService.updateUser(user.id, {
        email: emailChangingDto.newEmail,
      });
      await this.emailVerificationRepository.remove(emailVerification);

      this.mailerService.sendMail({
        to: emailChangingDto.newEmail,
        from: process.env.MAIL_FROM,
        subject: 'Verification successful in Quick Job ✔',
        template: './auth/emailVerified',
      });

      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async verifyEmailCreateUser(emailVerificationDto: EmailVerificationDto) {
    try {
      const emailVerification = await this.emailVerificationRepository.findOne({
        where: {
          emailToken: emailVerificationDto.emailToken,
        },
      });

      if (!emailVerification) {
        throw new NotFoundException('Email Verification not found');
      }

      const user = await this.usersService.findOneByEmail(
        emailVerificationDto.email,
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updateUserDto = new UpdateUserDto();
      updateUserDto.isVerified = true;
      await this.usersService.updateUser(user.id, updateUserDto);
      await this.emailVerificationRepository.remove(emailVerification);

      console.log('veryfied ' + user.email);

      this.mailerService.sendMail({
        to: user.email,
        from: process.env.MAIL_FROM,
        subject: 'Verification successful in Quick Job ✔',
        template: './auth/emailVerified',
      });

      return true;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async logout(userId: string) {
    try {
      await this.tokenService.updateToken(userId, '-');
      this.usersService.updateUser(userId, {
        refreshToken: '-',
      });

      return;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async refreshTokens(refreshToken_: string) {
    try {
      console.log('call refresh tokens');
      const verify = await this.jwtService.verifyAsync(refreshToken_, {
        secret: process.env.JWT_SECRET_REFRESH_TOKEN,
      });
      console.log('verify refresh tokens ', verify);

      const user = await this.usersService.findOneByUsername(verify.username);
      const token = await this.tokenService.findOneByUserId(user.id);

      if (!user || token.refreshToken === '-') {
        throw new ForbiddenException('Access Denied');
      }

      if (refreshToken_ !== token.refreshToken) {
        throw new ForbiddenException('Access Denied');
      }
      const tokens = await this.generateTokens(user);
      await this.tokenService.updateToken(user.id, tokens.refreshToken);
      console.log(' done verify refresh tokens ');
      return {
        email: user.email,
        ...tokens,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async SendMailVerifyPassword(email: string, reason: PasswordChangingReason) {
    try {
      const user = await this.usersService.findOneByEmail(email);
      if (!user) {
        throw new NotFoundException('USER NOT FOUND');
      }

      const randomBytes = crypto.randomBytes(6);
      const token = randomBytes.toString('hex').slice(0, 6);

      const forgottenPassword = this.forgottenPasswordRepository.create({
        user: user,
        token: token,
        reason: reason,
      });

      this.forgottenPasswordRepository.save(forgottenPassword);

      if (reason == PasswordChangingReason.Forgot) {
        this.mailerService.sendMail({
          to: email,
          from: process.env.MAIL_FROM,
          subject: 'Forgot password of account Quick Job ✔',
          template: './auth/changingPassword',
          context: {
            isForgotPass: true,
            // reason: 'Looks like you forgot your password.',
            token: token,
          },
        });
      }

      if (reason == PasswordChangingReason.Proactive) {
        this.mailerService.sendMail({
          to: email,
          from: process.env.MAIL_FROM,
          subject: 'Changing password of account Quick Job ✔',
          template: './auth/changingPassword',
          context: {
            isForgotPass: false,
            // reason:
            //   'The system has received a request to change your password.',
            token: token,
          },
        });
      }

      return {
        message: 'sended email reset Password',
      };
    } catch (error) {
      console.error('Send mail for password verification error:', error);
      throw error;
    }
  }

  async verifyEmailAndResetPassword(resetPassword: ResetPassworDto) {
    try {
      const changingPassword = await this.forgottenPasswordRepository.findOne({
        where: {
          token: resetPassword.newPasswordToken,
        },
      });

      if (!changingPassword) {
        throw new NotFoundException('WRONG TOKEN ENTERED');
      }

      if (
        changingPassword.resetSuccess === true ||
        (new Date().getTime() - changingPassword.time.getTime()) / 60000 > 5
      ) {
        return {
          message: 'code has expired.',
        };
      }

      await this.resetPassword(resetPassword);

      changingPassword.resetSuccess = true;
      await this.forgottenPasswordRepository.save(changingPassword);

      this.mailerService.sendMail({
        to: resetPassword.email,
        from: process.env.MAIL_FROM,
        subject: 'Your password of account Quick Job is changed✔',
        template: './auth/password-changed',
        context: {
          time: changingPassword.time,
          // reason:
          //   'The system has received a request to change your password.',
        },
      });

      return {
        message: 'password is changed.',
      };
    } catch (error) {
      console.error('Verify email and reset password error:', error);
      throw error;
    }
  }

  async resetPassword(resetPassword: ResetPassworDto) {
    try {
      const user = await this.usersService.findOneByEmail(resetPassword.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const hashnewPass = await bcrypt.hash(resetPassword.newPassword, 10);
      await this.usersService.updateUser(user.id, { password: hashnewPass });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async validateUserLocal(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findOneByUsername(username);
      if (user && (await bcrypt.compare(pass, user.password))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.error('User validation error:', error);
      throw error;
    }
  }

  async validateUserJwt(sub: string): Promise<any> {
    try {
      const user = await this.usersService.findOne(sub);
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.error('User validation error:', error);
      throw error;
    }
  }

  async validateUserGoogle(profile: Profile): Promise<any> {
    try {
      const user = await this.usersService.findOneByEmail(
        profile.emails[0].value,
      );
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      } else {
        const new_user = await this.usersService.createUser({
          username: profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          password: null,
          fullName: profile.name.familyName + ' ' + profile.name.givenName,
          phoneNumber: null,
          isVerified: true,
          refreshToken: null,
          createdBy: UserCreator.google,
          avatarUrl: null,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = new_user;
        return result;
      }
    } catch (error) {
      console.error('User validation error:', error);
      throw error;
    }
  }

  async login(user: any) {
    try {
      const tokens = await this.generateTokens(user);
      await this.tokenService.updateToken(user.id, tokens.refreshToken);

      const data = { user, tokens };
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  sendMail(mail: string) {
    this.mailerService.sendMail({
      to: 'email_test4@mailinator.com',
      from: process.env.MAIL_FROM,
      subject: 'Welcome to Quick Job ✔',
      template: './auth/welcome',
      context: {
        name: 'signUpDto.fullName',
        token: 'token',
        email: mail,
      },
    });
  }

  async throwEx() {
    throw new Error(
      'Email Verification not foundEmail Verification not foundEmail Verification not foundEmail Verification not found',
    );
  }
}
