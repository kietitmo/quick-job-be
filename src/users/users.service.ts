import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SearchingUserConditionDto } from './dto/searching-user-condition.dto';
import { PageDto } from 'src/pagnition/page.dto';
import { PageOptionsDto } from 'src/pagnition/page-option.dto';
import { PageMetaDto } from 'src/pagnition/page-meta.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user.');
    }
  }

  async findAll(
    pageOptionsDto: PageOptionsDto,
    conditions: SearchingUserConditionDto,
  ): Promise<PageDto<User>> {
    try {
      const queryBuilder = this.usersRepository
        .createQueryBuilder('user')
        .orderBy('user.createdAt', pageOptionsDto.order)
        .skip((pageOptionsDto.page - 1) * pageOptionsDto.take || 0)
        .take(pageOptionsDto.take);

      if (conditions) {
        if (conditions.username) {
          queryBuilder.andWhere('user.username LIKE :username', {
            username: `%${conditions.username}%`,
          });
        }

        if (conditions.email) {
          queryBuilder.andWhere('user.email LIKE :email', {
            email: `%${conditions.email}%`,
          });
        }

        if (conditions.name) {
          queryBuilder.andWhere('user.fullName LIKE :name', {
            name: `%${conditions.name}%`,
          });
        }

        if (conditions.role) {
          queryBuilder.andWhere('user.role = :role', {
            role: conditions.role,
          });
        }

        if (conditions.createdAfter) {
          queryBuilder.andWhere('user.createdAt >= :createdAfter', {
            createdAfter: conditions.createdAfter,
          });
        }

        if (conditions.isVerified) {
          queryBuilder.andWhere('user.isVerified = :isVerified', {
            isVerified: conditions.isVerified,
          });
        }

        if (conditions.createdBy) {
          queryBuilder.andWhere('user.createdBy = :createdBy', {
            createdBy: conditions.createdBy,
          });
        }

        if (conditions.phoneNumber) {
          queryBuilder.andWhere('user.phoneNumber = :phoneNumber', {
            phoneNumber: conditions.phoneNumber,
          });
        }
      }

      const [res, total] = await queryBuilder.getManyAndCount();

      const itemCount = total;

      const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

      return new PageDto(res, pageMetaDto);
    } catch (error) {
      console.error('Error retrieving users:', error);
      throw new Error('Failed to retrieve users.');
    }
  }

  async findOne(id: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOneBy({ id });
    } catch (error) {
      console.error('Error retrieving user:', error);
      throw new Error('Failed to retrieve user.');
    }
  }

  async findOneByUsername(username: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOneBy({ username });
    } catch (error) {
      console.error('Error retrieving user by username:', error);
      throw new Error('Failed to retrieve user by username.');
    }
  }

  async findOneByEmailAndPhoneNumber(
    email: string,
    phoneNumber: string,
  ): Promise<User | null> {
    try {
      return await this.usersRepository.findOneBy({ email, phoneNumber });
    } catch (error) {
      console.error('Error retrieving user by email and phoneNumber:', error);
      throw new Error('Failed to retrieve user by email and phoneNumber.');
    }
  }

  async findOneByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOneBy({ email });
    } catch (error) {
      console.error('Error retrieving user by email:', error);
      throw new Error('Failed to retrieve user by email.');
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.usersRepository.findOneBy({ id });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (updateUserDto.fullName) {
        user.fullName = updateUserDto.fullName;
      }

      if (updateUserDto.email) {
        user.email = updateUserDto.email;
      }

      if (updateUserDto.username) {
        user.username = updateUserDto.username;
      }

      if (updateUserDto.password) {
        user.password = updateUserDto.password;
      }

      if (updateUserDto.avatarUrl) {
        user.avatarUrl = updateUserDto.avatarUrl;
      }

      if (updateUserDto.refreshToken) {
        user.refreshToken = updateUserDto.refreshToken;
      }

      if (updateUserDto.isVerified) {
        user.isVerified = updateUserDto.isVerified;
      }

      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user.');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.usersRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      throw new Error('Failed to remove user.');
    }
  }

  async uploadAvatar(userId: string, imageUrl: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.avatarUrl = imageUrl;
    return await this.usersRepository.save(user);
  }
}
