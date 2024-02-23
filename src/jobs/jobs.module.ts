import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { Job } from './entities/job.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobImage } from './entities/job_image.entity';
import { JobVideo } from './entities/job_video.entity';
import { JobAddressModule } from 'src/address/jobAddress/jobAddress.module';
import { AddressVietnamModule } from 'src/address/vietnamAdress/addressVietnam.module';
import { District } from 'src/address/vietnamAdress/entities/district.entity';
import { Province } from 'src/address/vietnamAdress/entities/province.entity';
import { Region } from 'src/address/vietnamAdress/entities/region.entity';
import { Unit } from 'src/address/vietnamAdress/entities/unit.entity';
import { Ward } from 'src/address/vietnamAdress/entities/ward.entity';
import { JobAddress } from 'src/address/jobAddress/entities/jobAddress.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Job,
      JobImage,
      JobVideo,
      Province,
      District,
      Ward,
      Unit,
      Region,
      JobAddress,
    ]),
    JobAddressModule,
    AddressVietnamModule,
    // TypeOrmModule.forRoot({
    //   name: 'vietnamese_administrative_units',
    //   type: 'postgres',
    //   host: process.env.DBA_HOST,
    //   port: +process.env.DBA_PORT,
    //   username: "postgres",
    //   password: "123456",
    //   database: process.env.DBA_NAME,
    //   entities: [Province, District, Ward, Unit, Region],
    //   // autoLoadEntities: true,
    //   synchronize: true,
    // }),
    UsersModule,
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [TypeOrmModule, JobsService],
})
export class JobsModule {}
