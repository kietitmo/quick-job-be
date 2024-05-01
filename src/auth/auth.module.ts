import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { EmailVerification } from './entities/emailVerification.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ChangingPassword } from './entities/changingPassword.entity';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { Token } from './entities/token.entity';
import { TokenService } from './token.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([EmailVerification, ChangingPassword, Token]),
    PassportModule.register({ session: true }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.MAIL_HOST,
          secure: false,
          auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: `"No Reply" <${process.env.MAIL_FROM}>`,
        },
        template: {
          dir: 'src/templates/email',
          adapter: new PugAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
