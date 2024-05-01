import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
    private readonly userService: UsersService,
  ) {}

  async createToken(userId: string, refreshToken: string): Promise<Token> {
    try {
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('USER NOT FOUND');
      }

      const token = this.tokensRepository.create({ user, refreshToken });
      console.log(token);
      return await this.tokensRepository.save(token);
    } catch (error) {
      console.error(`Error creating token: ${error.message}`);
      throw new Error('Failed to create token. Please try again.');
    }
  }

  async findAll(): Promise<Token[]> {
    try {
      const queryBuilder = this.tokensRepository
        .createQueryBuilder('token')
        .leftJoinAndSelect('token.user', 'user');

      return queryBuilder.getMany();
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      throw new Error('Failed to retrieve tokens.');
    }
  }

  async findOne(id: string): Promise<Token> {
    try {
      const token = this.tokensRepository
        .createQueryBuilder('token')
        .leftJoinAndSelect('token.user', 'user')
        .where('token.id = :id', { id })
        .getOne();

      if (!token) {
        throw new NotFoundException('Token not found');
      }

      return token;
    } catch (error) {
      console.error(`Error fetching token: ${error.message}`);
      throw new Error('Failed to fetch token. Please try again.');
    }
  }

  async findOneByUserId(id: string): Promise<Token> {
    try {
      const token = this.tokensRepository
        .createQueryBuilder('token')
        .leftJoinAndSelect('token.user', 'user')
        .where('user.id = :id', { id })
        .getOne();

      if (!token) {
        throw new NotFoundException('Token not found');
      }

      return token;
    } catch (error) {
      console.error(`Error fetching token: ${error.message}`);
      throw new Error('Failed to fetch token. Please try again.');
    }
  }

  async updateToken(userId: string, newToken: string): Promise<Token> {
    try {
      const token = await this.findOneByUserId(userId);

      if (!token) {
        throw new NotFoundException('Token not found');
      }

      token.refreshToken = newToken;

      return await this.tokensRepository.save(token);
    } catch (error) {
      console.error(`Error updating token: ${error.message}`);
      throw new Error('Failed to update token. Please try again.');
    }
  }

  async remove(userId: string): Promise<void> {
    try {
      const token = await this.findOneByUserId(userId);
      await this.tokensRepository.delete(token);
    } catch (error) {
      console.error(`Error deleting token: ${error.message}`);
      throw new Error('Failed to delete token. Please try again.');
    }
  }
}
