import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { JobsModule } from './jobs/jobs.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ApplicationsModule } from './applications/applications.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { JobExecutorModule } from './job-user/job-executor.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './errorFilter/error.filter';
import { MessagesModule } from './messages/messages.module';
import { TypeOrmExceptionFilter } from './errorFilter/typeORMError.filter';

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
    JobExecutorModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: TypeOrmExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
