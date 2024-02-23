import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomStorageUserAvatar } from './user-upload-avatar-config/user-avatar-config';
import { SearchingUserConditionDto } from './dto/searching-user-condition.dto';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Get()
  findAll(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query() searchConditions?: SearchingUserConditionDto,
  ): Promise<PageDto<User>> {
    return this.usersService.findAll(pageOptionsDto, searchConditions);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('upload-avatar')
  @UseInterceptors(FileInterceptor('avatar', CustomStorageUserAvatar()))
  async uploadFiles(
    @UploadedFile()
    file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.usersService.uploadAvatar(
      req.user.id,
      file.destination + '/' + file.filename,
    );
  }
}
