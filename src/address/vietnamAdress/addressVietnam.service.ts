import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from './entities/province.entity';
import { Repository } from 'typeorm';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';
import { Unit } from './entities/unit.entity';
import { Region } from './entities/region.entity';

@Injectable()
export class AddressVietNamService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepository: Repository<Province>,

    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,

    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,

    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,

    @InjectRepository(Region)
    private readonly regionRepository: Repository<Region>,
  ) {}

  async getAllProvinces(): Promise<Province[]> {
    try {
      return await this.provinceRepository.find();
    } catch (error) {
      throw new Error(`Error fetching provinces: ${error.message}`);
    }
  }

  async findProvinceByConditions(conditions: any): Promise<Province[]> {
    try {
      const queryBuilder =
        this.provinceRepository.createQueryBuilder('provinces');

      if (conditions.code) {
        queryBuilder.andWhere('provinces.code = :code', {
          code: conditions.code,
        });
      }

      if (conditions.name) {
        queryBuilder.andWhere('provinces.name LIKE :name', {
          name: `%${conditions.name}%`,
        });
      }

      if (conditions.name_en) {
        queryBuilder.andWhere('provinces.name_en LIKE :name_en', {
          name_en: `%${conditions.name_en}%`,
        });
      }

      if (conditions.administrative_region_id) {
        queryBuilder.andWhere(
          'provinces.administrative_region_id = :administrative_region_id',
          { administrative_region_id: conditions.administrative_region_id },
        );
      }

      const foundProvinces = await queryBuilder.getMany();
      return foundProvinces;
    } catch (error) {
      throw new Error(`Error finding provinces: ${error.message}`);
    }
  }

  async getAllDistricts(): Promise<District[]> {
    try {
      return await this.districtRepository.find();
    } catch (error) {
      throw new Error(`Error fetching districts: ${error.message}`);
    }
  }

  async getAllWards(): Promise<Ward[]> {
    try {
      return await this.wardRepository.find();
    } catch (error) {
      throw new Error(`Error fetching wards: ${error.message}`);
    }
  }

  async getDistrictsByProvinceCode(province_code: string): Promise<District[]> {
    try {
      return this.districtRepository
        .createQueryBuilder('districts')
        .andWhere('districts.province_code = :province_code', {
          province_code: province_code,
        })
        .getMany();
    } catch (error) {
      throw new Error(`Error fetching districts: ${error.message}`);
    }
  }

  async getWardsByProvinceCode(district_code: string): Promise<Ward[]> {
    try {
      return this.wardRepository
        .createQueryBuilder('wards')
        .andWhere('wards.district_code = :district_code', {
          district_code: district_code,
        })
        .getMany();
    } catch (error) {
      throw new Error(`Error fetching wards: ${error.message}`);
    }
  }

  async getDistrict(code: string): Promise<District> {
    try {
      const district = await this.districtRepository.findOneBy({ code });

      if (!district) {
        throw new NotFoundException('District not found');
      }

      return district;
    } catch (error) {
      throw new Error(`Error fetching district: ${error.message}`);
    }
  }

  async getProvince(code: string): Promise<Province> {
    try {
      const province = await this.provinceRepository.findOneBy({ code });

      if (!province) {
        throw new NotFoundException('Province not found');
      }

      return province;
    } catch (error) {
      throw new Error(`Error fetching province: ${error.message}`);
    }
  }

  async getWard(code: string): Promise<Ward> {
    try {
      const ward = await this.wardRepository.findOneBy({ code });

      if (!ward) {
        throw new NotFoundException('Ward not found');
      }

      return ward;
    } catch (error) {
      throw new Error(`Error fetching ward: ${error.message}`);
    }
  }
}
