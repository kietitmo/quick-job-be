import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobAddress } from './entities/jobAddress.entity';
import { JobAddressService } from './jobAddress.service';
import { JobAddressController } from './jobAddress.controller';
import { AddressVietnamModule } from '../vietnamAdress/addressVietnam.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobAddress]), AddressVietnamModule],
  controllers: [JobAddressController],
  providers: [JobAddressService],
  exports: [TypeOrmModule, JobAddressService],
})
export class JobAddressModule {}
