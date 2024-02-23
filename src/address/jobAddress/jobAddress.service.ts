import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobAddress } from './entities/jobAddress.entity';

@Injectable()
export class JobAddressService {
  constructor(
    @InjectRepository(JobAddress)
    private readonly addressRepository: Repository<JobAddress>,
  ) {}

  async findAll(): Promise<JobAddress[]> {
    try {
      return await this.addressRepository
        .createQueryBuilder('address')
        .leftJoinAndSelect('address.province', 'province')
        .leftJoinAndSelect('address.district', 'district')
        .leftJoinAndSelect('address.ward', 'ward')
        .leftJoinAndSelect('address.job', 'job')
        .select([
          'address.id',
          'province.name',
          'district.name',
          'ward.name',
          'address.street',
          'address.houseNumber',
        ])
        .getMany();
    } catch (error) {
      console.error(`Error fetching job addresses: ${error.message}`);
      throw new Error('Failed to fetch job addresses. Please try again.');
    }
  }

  async findOne(id: string): Promise<JobAddress | null> {
    try {
      const jobAddress = await this.addressRepository
        .createQueryBuilder('address')
        .where('address.id = :id', { id })
        .leftJoinAndSelect('address.province', 'province')
        .leftJoinAndSelect('address.district', 'district')
        .leftJoinAndSelect('address.ward', 'ward')
        .leftJoinAndSelect('address.job', 'job')
        .select([
          'province.name',
          'district.name',
          'ward.name',
          'address.street',
          'address.houseNumber',
        ])
        .getOne();

      if (!jobAddress) {
        throw new NotFoundException('Job address not found');
      }

      return jobAddress;
    } catch (error) {
      console.error(`Error fetching job address: ${error.message}`);
      throw new Error('Failed to fetch job address. Please try again.');
    }
  }
}
