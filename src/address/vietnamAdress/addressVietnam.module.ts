import { Module } from '@nestjs/common';
import { AddressVietNamService } from './addressVietnam.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Province, District, Ward])],
  providers: [AddressVietNamService],
  exports: [TypeOrmModule, AddressVietNamService],
})
export class AddressVietnamModule {}
