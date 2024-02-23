import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersService } from './users/users.service';
import { JobsService } from './jobs/jobs.service';
import { ReviewsService } from './reviews/reviews.service';
import { ApplicationsService } from './applications/applications.service';
import { AuthModule } from './auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { JobAddressService } from './address/jobAddress/jobAddress.service';
import { AddressVietnamModule } from './address/vietnamAdress/addressVietnam.module';
import { JobAddressModule } from './address/jobAddress/jobAddress.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { JobUserModule } from './job-user/job-user.module';
import { JobUserService } from './job-user/job-user.service';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './errorFilter/error.filter';
import { MessagesModule } from './messages/messages.module';
import { MessagesService } from './messages/messages.service';

@Module({
  imports: [
    UsersModule,
    JobsModule,
    ReviewsModule,
    ApplicationsModule,
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      // entities: [User, Job, JobImage, JobVideo, PrivateChat, Review, Application, JobAddress],
      autoLoadEntities: true,
      synchronize: true,
    }),
    AddressVietnamModule,
    JobAddressModule,
    MailerModule.forRoot({
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
    JobUserModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UsersService,
    JobsService,
    ReviewsService,
    ApplicationsService,
    JwtService,
    JobAddressService,
    JobUserService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    MessagesService,
  ],
})
export class AppModule {}
