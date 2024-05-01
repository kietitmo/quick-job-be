import { Controller, Get, Param, Query } from '@nestjs/common';
import { AddressVietNamService } from '../vietnamAdress/addressVietnam.service';
import { Public } from 'src/auth/decorators/IsPublic.decorator';
import { JobAddressService } from './jobAddress.service';

@Controller('address')
export class JobAddressController {
  constructor(
    private readonly addressService: AddressVietNamService,
    private readonly jobAddressService: JobAddressService,
  ) {}

  @Public()
  @Get('provinces/search')
  async searchJobs(@Query() conditions: any) {
    const foundJobs =
      await this.addressService.findProvinceByConditions(conditions);
    return foundJobs;
  }

  @Public()
  @Get('provinces')
  getAllProvinces() {
    const provinces = this.addressService.getAllProvinces();
    return provinces;
  }

  @Public()
  @Get('districts/:province_code')
  async getDistricts(@Param('province_code') province_code: string) {
    const districts =
      await this.addressService.getDistrictsByProvinceCode(province_code);
    return districts;
  }

  @Public()
  @Get('wards/:district_code')
  async getWards(@Param('district_code') district_code: string) {
    const wards =
      await this.addressService.getWardsByDistrictCode(district_code);
    return wards;
  }

  @Public()
  @Get('districts')
  async getAllDistricts() {
    const provinces = await this.addressService.getAllDistricts();
    return provinces;
  }

  @Public()
  @Get()
  async getAll() {
    return this.jobAddressService.findAll();
  }

  @Public()
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.jobAddressService.findOne(id);
  }
}
