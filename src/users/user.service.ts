import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  //* FIND BY EMAIL
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  //*1 GET ALL USERS DATA FROM DATABASE
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  //*2 GET SINGLE USER FROM DATABASE
  async findOne(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return user;
  }

  //*3 CREATE A USER IN DATABASE
  async create(
    createUserDto: CreateUserDto,
    createdById: string,
  ): Promise<User> {
    try {
      const { username, email, password, isAdmin } = createUserDto;
      const DuplicateEmail = await this.userRepository.findOneBy({
        email: email,
      });
      if (DuplicateEmail) throw new ForbiddenException('Email already exists.');
      const DuplicateUsername = await this.userRepository.findOneBy({
        username: username,
      });
      if (DuplicateUsername)
        throw new ForbiddenException('Username already exists.');

      const user = new User();
      user.username = username;
      user.email = email;
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltOrRounds);
      user.password = hashedPassword;
      user.isAdmin = isAdmin;
      user.createdById = createdById;

      return await this.userRepository.save(user);
    } catch (error) {
      throw new Error('Error creating user.');
    }
  }

  //*4 UPDATE USER
  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
    reqUser,
  ): Promise<User> {
    //? Checking if user is admin or accessing his account
    if (userId === reqUser.userId || reqUser.isAdmin) {
      const { username, email, password } = updateUserDto;
      const user = await this.userRepository.findOne({ where: { userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.username = username || user.username;
      user.email = email || user.email;
      if (password) {
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        user.password = hashedPassword || user.password;
      }
      user.UpdatedById = reqUser.userId;

      return await this.userRepository.save(user);
    }
  }

  //*5 DELETE A USER FROM DATABSE
  async remove(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { userId } });
      await this.userRepository.remove(user);
    } catch (error) {
      throw new ForbiddenException('Error deleting user.');
    }
  }

  //*6 UPLOAD PFX FILE
  async uploadPfx(reqUser, userId: string, file) {
    try {
      if (reqUser.userId === userId || reqUser.isAdmin) {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (user.pfxFilepath.length > 0)
          throw new ForbiddenException('Pfx already exists.');
        user.pfxFileName = file.filename;
        user.pfxFilepath = file.path;
        user.pfxUpdatedBy = reqUser.userId;
        return await this.userRepository.save(user);
      } else {
        throw new ForbiddenException(
          'Only Admin and file Owner can access this file.',
        );
      }
    } catch (error) {
      throw new ForbiddenException('Error uploading pfx.');
    }
  }

  //*7 DELETE PFX FILE
  async deletePfx(reqUser, userId: string, filePath: string) {
    try {
      if (reqUser.userId === userId || reqUser.isAdmin) {
        const user = await this.userRepository.findOne({ where: { userId } });
        await fs.promises.unlink(filePath);
        user.pfxFileName = '';
        user.pfxFilepath = '';
        user.pfxUpdatedBy = '';
        return await this.userRepository.save(user);
      } else {
        throw new ForbiddenException(
          'Only Admin and file Owner can access this file.',
        );
      }
    } catch (error) {
      throw new ForbiddenException('Error uploading pfx.');
    }
  }
}
