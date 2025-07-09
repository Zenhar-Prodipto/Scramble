// src/users/services/users.service.ts
import { Injectable, HttpStatus } from "@nestjs/common";
import { UsersRepository } from "../repositories/users.repository";
import { SignupDto } from "../../auth/dto/signup.dto";
import { User } from "../schemas/users.schema";
import { ApiException } from "src/common/exceptions/api.exceptions";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.usersRepository.findByEmail(email);
      if (!user) {
        throw new ApiException("User not found", HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(
        "Failed to find user",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw new ApiException("User not found", HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof ApiException) {
        throw error;
      }
      throw new ApiException(
        "Failed to find user",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async createUser(signupDto: SignupDto): Promise<User> {
    try {
      return await this.usersRepository.create(signupDto);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ApiException("Email already exists", HttpStatus.CONFLICT);
      }
      if (error.name === "ValidationError") {
        throw new ApiException(
          "Invalid user data",
          HttpStatus.BAD_REQUEST,
          error.message
        );
      }
      throw new ApiException(
        "Failed to create user",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
}
