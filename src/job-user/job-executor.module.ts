import { Module } from '@nestjs/common';
import { JobExecutorController } from './job-executor.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobExecutor } from './entities/job-executor.entity';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { ApplicationsModule } from 'src/applications/applications.module';
import { JobExecutorService } from './job-executor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobExecutor]),
    UsersModule,
    JobsModule,
    ApplicationsModule,
  ],
  controllers: [JobExecutorController],
  providers: [JobExecutorService],
  exports: [TypeOrmModule],
})
export class JobExecutorModule {}
