import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { SearchingApplicationConditionDto } from './dto/seaching-application-condition.dto';
import { Application } from './entities/application.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createApplicationDto: CreateApplicationDto) {
    return await this.applicationsService.createApplication(
      createApplicationDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.applicationsService.findOne(id);
  }

  @Get()
  async findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() searchConditions?: SearchingApplicationConditionDto,
  ): Promise<PageDto<Application>> {
    return await this.applicationsService.findAll(
      pageOptionsDto,
      searchConditions,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return await this.applicationsService.updateApplication(
      id,
      updateApplicationDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.applicationsService.remove(id);
  }
}
