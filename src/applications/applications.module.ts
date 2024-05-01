import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  imports: [TypeOrmModule.forFeature([Application]), UsersModule, JobsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [TypeOrmModule, ApplicationsService],
})
export class ApplicationsModule {}
