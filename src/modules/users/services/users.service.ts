import { HttpStatus, Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { ERROR_CODE } from '../../../common/constants/error-code.constant';
import { AppException } from '../../../common/exceptions/app.exception';
import { CreateUserDto } from '../dto/create-user.dto';

import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new AppException({
        message: 'User already exists',
        statusCode: HttpStatus.CONFLICT,
        code: ERROR_CODE.USER_ALREADY_EXISTS,
      });
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.usersRepository.create({
      ...createUserDto,

      password: hashedPassword,
    });
  }

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }
}
