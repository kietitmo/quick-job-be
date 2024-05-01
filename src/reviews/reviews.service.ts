import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewMedia } from './entities/reviewMedia.entity';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { SearchingReviewConditionDto } from './dto/searching-review-condition.dto';
import { PageMetaDto } from 'src/pagnition/page-meta.dto';
import { JobsService } from 'src/jobs/jobs.service';
import { UsersService } from 'src/users/users.service';
import { ReviewMediaType } from './enum/review-media-type.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(ReviewMedia)
    private reviewsMediaRepository: Repository<ReviewMedia>,
    private readonly jobService: JobsService,
    private readonly userService: UsersService,
  ) {}

  async createReview(
    createReviewDto: CreateReviewDto,
    files?: Array<Express.Multer.File>,
  ): Promise<Review> {
    try {
      const newReview = this.reviewsRepository.create(createReviewDto);

      if (files) {
        files.forEach(async (file) => {
          if (file.mimetype.startsWith('image')) {
            const reviewMedia = new ReviewMedia();
            reviewMedia.url = '/uploads/review/images/' + file.filename;
            reviewMedia.review = newReview;
            reviewMedia.mediaType = ReviewMediaType.IMAGE;
            await this.reviewsMediaRepository.save(reviewMedia);
          }

          if (file.mimetype.startsWith('video')) {
            const reviewMedia = new ReviewMedia();
            reviewMedia.url = '/uploads/review/videos/' + file.filename;
            reviewMedia.review = newReview;
            reviewMedia.mediaType = ReviewMediaType.VIDEO;
            await this.reviewsMediaRepository.save(reviewMedia);
          }
        });
      }

      const reviewer = await this.userService.findOne(
        createReviewDto.reviewerId,
      );

      if (reviewer) {
        newReview.reviewer = reviewer;
      }

      const reviewee = await this.userService.findOne(
        createReviewDto.revieweeId,
      );

      if (reviewee) {
        newReview.reviewee = reviewee;
      }

      const job = await this.jobService.findOne(createReviewDto.jobId);

      if (job) {
        newReview.job = job;
      }

      return await this.reviewsRepository.save(newReview);
    } catch (error) {
      console.error('Error creating review:', error);
      throw new Error('Failed to create review.');
    }
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    conditions: SearchingReviewConditionDto,
  ): Promise<PageDto<Review>> {
    try {
      const queryBuilder = this.reviewsRepository
        .createQueryBuilder('review')
        .orderBy('review.createdAt', pageOptionsDto.order)
        .skip((pageOptionsDto.page - 1) * pageOptionsDto.take || 0)
        .take(pageOptionsDto.take)
        .leftJoinAndSelect('review.job', 'job')
        .leftJoinAndSelect('review.reviewer', 'reviewer')
        .leftJoinAndSelect('review.reviewee', 'reviewee')
        .leftJoinAndSelect('review.media', 'review_media');

      if (conditions) {
        if (conditions.reviewerId) {
          queryBuilder.andWhere('reviewer.id = :reviewerId', {
            reviewerId: conditions.reviewerId,
          });
        }

        if (conditions.revieweeId) {
          queryBuilder.andWhere('reviewee.id = :revieweeId', {
            revieweeId: conditions.revieweeId,
          });
        }

        if (conditions.jobId) {
          queryBuilder.andWhere('job.id = :jobId', {
            jobId: conditions.jobId,
          });
        }

        if (conditions.content) {
          queryBuilder.andWhere('review.content LIKE :content', {
            content: conditions.content,
          });
        }

        if (conditions.ratingGreater) {
          queryBuilder.andWhere('review.rating > :ratingGreater', {
            ratingGreater: conditions.ratingGreater,
          });
        }

        if (conditions.reviewType) {
          queryBuilder.andWhere('review.reviewType = :reviewType', {
            reviewType: conditions.reviewType,
          });
        }

        if (conditions.createdAfter) {
          queryBuilder.andWhere('review.createdAt >= :createdAfter', {
            createdAfter: conditions.createdAfter,
          });
        }
      }

      const [res, total] = await queryBuilder.getManyAndCount();

      const itemCount = total;

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

      return new PageDto(res, pageMetaDto);
    } catch (error) {
      console.error('Error retrieving reviews:', error);
      throw new Error('Failed to retrieve reviews.');
    }
  }

  async findOne(id: string): Promise<Review | null> {
    try {
      const review = this.reviewsRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.job', 'job')
        .leftJoinAndSelect('review.reviewer', 'reviewer')
        .leftJoinAndSelect('review.reviewee', 'reviewee')
        .leftJoinAndSelect('review.media', 'review_media')
        .where('review.id = :id', { id })
        .getOne();

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      return review;
    } catch (error) {
      console.error('Error retrieving review:', error);
      throw new Error('Failed to retrieve review.');
    }
  }

  async updateReview(
    id: string,
    updateReviewDto: UpdateReviewDto,
    files?: Array<Express.Multer.File>,
  ): Promise<Review> {
    try {
      const review = await this.reviewsRepository.findOneBy({ id });

      if (!review) {
        throw new NotFoundException('Review not found');
      }

      if (updateReviewDto.content) {
        review.content = updateReviewDto.content;
      }

      if (updateReviewDto.rating) {
        review.rating = updateReviewDto.rating;
      }

      if (updateReviewDto.jobId) {
        const job = await this.jobService.findOne(id);
        if (job) {
          review.job = job;
        }
      }

      if (updateReviewDto.reviewerId) {
        const reviewer = await this.userService.findOne(
          updateReviewDto.reviewerId,
        );
        if (reviewer) {
          review.reviewer = reviewer;
        }
      }

      if (updateReviewDto.revieweeId) {
        const reviewee = await this.userService.findOne(
          updateReviewDto.revieweeId,
        );
        if (reviewee) {
          review.reviewee = reviewee;
        }
      }

      if (updateReviewDto.reviewType) {
        review.reviewType = updateReviewDto.reviewType;
      }

      if (files) {
        files.forEach(async (file) => {
          if (file.mimetype.startsWith('image')) {
            const reviewMedia = new ReviewMedia();
            reviewMedia.url = '/uploads/review/images/' + file.filename;
            reviewMedia.review = review;
            reviewMedia.mediaType = ReviewMediaType.IMAGE;
            await this.reviewsMediaRepository.save(reviewMedia);
          }

          if (file.mimetype.startsWith('video')) {
            const reviewMedia = new ReviewMedia();
            reviewMedia.url = '/uploads/review/videos/' + file.filename;
            reviewMedia.review = review;
            reviewMedia.mediaType = ReviewMediaType.VIDEO;
            await this.reviewsMediaRepository.save(reviewMedia);
          }
        });
      }

      return await this.reviewsRepository.save(review);
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error('Failed to update review.');
    }
  }

  async removeReview(id: string): Promise<void> {
    try {
      const result = await this.reviewsRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('Review not found');
      }
    } catch (error) {
      console.error('Error removing review:', error);
      throw new Error('Failed to remove review.');
    }
  }

  async removeReviewMedia(id: string): Promise<void> {
    try {
      const job = await this.reviewsMediaRepository.findOneBy({ id });

      if (!job) {
        throw new NotFoundException('Job Video not found');
      }

      await this.reviewsMediaRepository.delete(id);
    } catch (error) {
      console.error('Error deleting review media:', error);
      throw new Error('Failed to delete review media.');
    }
  }
}
