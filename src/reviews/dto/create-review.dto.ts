import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReviewType } from '../enum/review-type.enum';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  reviewerId: string;

  @IsString()
  @IsNotEmpty()
  revieweeId: string;

  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsNumberString()
  rating: number;

  @IsEnum(ReviewType)
  reviewType: ReviewType;
}
