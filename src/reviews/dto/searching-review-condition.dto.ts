import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReviewType } from '../enum/review-type.enum';

export class SearchingReviewConditionDto {
  @IsOptional()
  @IsString()
  reviewerId: string;

  @IsOptional()
  @IsString()
  revieweeId: string;

  @IsOptional()
  @IsString()
  jobId: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsOptional()
  @IsNumber()
  ratingGreater: number;

  @IsOptional()
  @IsEnum(ReviewType)
  reviewType: ReviewType;

  @IsOptional()
  @IsDateString()
  createdAfter: Date;
}
