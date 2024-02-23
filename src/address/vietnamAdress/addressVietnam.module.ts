import { Module } from '@nestjs/common';
import { AddressVietNamService } from './addressVietnam.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';
import { Unit } from './entities/unit.entity';
import { Region } from './entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Province, District, Ward, Unit, Region])],
  providers: [AddressVietNamService],
  exports: [TypeOrmModule, AddressVietNamService],
})
export class AddressVietnamModule {}
