import { Module } from '@nestjs/common';
import { JobUserService } from './job-user.service';
import { JobUserController } from './job-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobUser } from './entities/job-user.entity';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobUser]), UsersModule, JobsModule],
  controllers: [JobUserController],
  providers: [JobUserService],
  exports: [TypeOrmModule],
})
export class JobUserModule {}
