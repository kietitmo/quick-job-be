import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { Job } from 'src/jobs/entities/job.entity';
import { Province } from 'src/address/vietnamAdress/entities/province.entity';
import { District } from 'src/address/vietnamAdress/entities/district.entity';
import { Ward } from 'src/address/vietnamAdress/entities/ward.entity';

@Entity('jobAddresses')
export class JobAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'province_code' })
  province: Province;

  @ManyToOne(() => District)
  @JoinColumn({ name: 'district_code' })
  district: District;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'ward_code' })
  ward: Ward;

  @Column({ type: 'varchar', length: 255, nullable: true })
  street: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  houseNumber: string;

  @OneToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;
}
