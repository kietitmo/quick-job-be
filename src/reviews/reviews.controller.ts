import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { SearchingReviewConditionDto } from './dto/searching-review-condition.dto';
import { Review } from './entities/review.entity';
import { Public } from 'src/auth/decorators/IsPublic.decorator';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CustomStorageReviewMedia } from './storage-review-config';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files', null, CustomStorageReviewMedia))
  create(
    @Body() createReviewDto: CreateReviewDto,
    @UploadedFiles()
    files?: Array<Express.Multer.File>,
  ) {
    return this.reviewsService.createReview(createReviewDto, files);
  }

  @Public()
  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() searchConditions?: SearchingReviewConditionDto,
  ): Promise<PageDto<Review>> {
    return await this.reviewsService.findAll(pageOptionsDto, searchConditions);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.reviewsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', null, CustomStorageReviewMedia))
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @UploadedFiles()
    files?: Array<Express.Multer.File>,
  ) {
    return await this.reviewsService.updateReview(id, updateReviewDto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.reviewsService.removeReview(id);
  }
}
