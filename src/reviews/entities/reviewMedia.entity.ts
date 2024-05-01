import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Review } from './review.entity';
import { ReviewMediaType } from '../enum/review-media-type.enum';

@Entity('review_media')
export class ReviewMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column({ type: 'enum', enum: ReviewMediaType })
  mediaType: ReviewMediaType;

  @ManyToOne(() => Review, (review) => review.media)
  review: Review;
}
