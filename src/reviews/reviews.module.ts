import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewMedia } from './entities/reviewMedia.entity';
import { UsersModule } from 'src/users/users.module';
import { JobsModule } from 'src/jobs/jobs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ReviewMedia]),
    UsersModule,
    JobsModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [TypeOrmModule],
})
export class ReviewsModule {}
