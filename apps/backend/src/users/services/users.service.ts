// src/users/services/users.service.ts
import {
  Injectable,
  HttpStatus,
  Logger,
  HttpException,
  forwardRef,
  Inject,
} from "@nestjs/common";
import { UsersRepository } from "../repositories/users.repository";
import { SignupDto } from "../../auth/dto/signup.dto";
import { User } from "../schemas/users.schema";
import { ApiException, ApiSuccess } from "src/common/exceptions/api.exceptions";
import { UserResponseData } from "../interfaces/users.interface";
import { UpdateUserDto } from "../dto/update-user.dto";
import { RedisService } from "src/shared/services/redis_service";
import { UpdatePasswordDto } from "../dto/update-password.dto";
import { AuthService } from "../../auth/services/auth.service";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService
  ) {}

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

  async updateLastLogin(userId: string): Promise<User> {
    try {
      const user = await this.usersRepository.updateLastLogin(userId);
      if (!user) {
        throw new ApiException("User not found", HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      // Handle specific errors from the repository
      if (error.name === "CastError") {
        throw new ApiException(
          "Invalid user ID format",
          HttpStatus.BAD_REQUEST,
          error.message
        );
      }

      //handle Mongoose validation errors
      if (error.name === "ValidationError") {
        throw new ApiException(
          "Validation error",
          HttpStatus.BAD_REQUEST,
          error.message
        );
      }
      // Handle other errors
      throw new ApiException(
        "Failed to update last login",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async getProfile(userId: string): Promise<ApiSuccess<UserResponseData>> {
    try {
      console.log(`Fetching profile for user ${userId}`);
      this.logger.log(`Fetching profile for user ${userId}`);
      const cacheKey = `user:${userId}`;
      const cachedUser = await this.redisService.get(cacheKey);
      if (cachedUser) {
        console.log(`Cache hit for user ${userId}`);
        const user = JSON.parse(cachedUser);
        this.logger.log(`Retrieved user profile for ${userId} from cache`);
        return {
          success: true,
          message: "User profile retrieved successfully",
          status: HttpStatus.OK,
          data: { user },
        };
      }
      this.logger.log(`Cache miss for user ${userId}, fetching from database`);
      console.log(`Cache miss for user ${userId}, fetching from database`);

      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new ApiException("User not found", HttpStatus.NOT_FOUND);
      }

      const userData: UserResponseData["user"] = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        gender: user.gender,
        avatar: user.avatar,
        usageType: user.usageType,
        company: user.company,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        projects: user.projects.map((id) => id.toString()),
      };

      // Cache user data for 1 hour
      try {
        await this.redisService.set(cacheKey, JSON.stringify(userData), 3600);
      } catch (error) {
        this.logger.warn(
          `Failed to cache user profile for ${userId}: ${error.message}`,
          error.stack
        );
        // Continue without throwing, as we can still return the user data
      }

      return {
        success: true,
        message: "User profile retrieved successfully",
        status: HttpStatus.OK,
        data: { user: userData },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get profile for user ${userId}: ${error.message}`,
        error.stack
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ApiException(
        "Failed to get user profile",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto
  ): Promise<ApiSuccess<UserResponseData>> {
    try {
      const user = await this.usersRepository.updateUser(userId, updateUserDto);
      if (!user) {
        throw new ApiException("User not found", HttpStatus.NOT_FOUND);
      }

      const userData: UserResponseData["user"] = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        gender: user.gender,
        avatar: user.avatar,
        usageType: user.usageType,
        company: user.company,
        lastLogin: user.lastLogin,
        isActive: user.isActive,
        projects: user.projects.map((id) => id.toString()),
      };

      try {
        await this.redisService.del(`user:${userId}`);
        await this.redisService.del(`user:email:${user.email}`);
        await this.redisService.set(
          `user:${userId}`,
          JSON.stringify(userData),
          3600
        );
      } catch (error) {
        this.logger.warn(
          `Failed to update cache for user ${userId}: ${error.message}`,
          error.stack
        );
      }

      return {
        success: true,
        message: "User profile updated successfully",
        status: HttpStatus.OK,
        data: { user: userData },
      };
    } catch (error) {
      this.logger.error(
        `Failed to update profile for user ${userId}: ${error.message}`,
        error.stack
      );
      if (error.name === "CastError") {
        throw new ApiException(
          "Invalid user ID format",
          HttpStatus.BAD_REQUEST,
          error.message
        );
      }
      if (error.name === "ValidationError") {
        throw new ApiException(
          "Validation error",
          HttpStatus.BAD_REQUEST,
          error.message
        );
      }
      throw new ApiException(
        "Failed to update user profile",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto
  ): Promise<ApiSuccess<null>> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new ApiException("User not found", HttpStatus.NOT_FOUND);
      }

      const isMatch = await this.authService.checkPasswordMatch(
        updatePasswordDto.oldPassword,
        user.password
      );

      if (!isMatch) {
        throw new ApiException(
          "Incorrect old password",
          HttpStatus.BAD_REQUEST
        );
      }

      await this.usersRepository.updatePassword(
        userId,
        updatePasswordDto.newPassword
      );

      try {
        await this.redisService.del(`user:${userId}`);
        await this.redisService.del(`user:email:${user.email}`);
        await this.redisService.delRefreshToken(userId);
      } catch (error) {
        this.logger.warn(
          `Failed to invalidate cache/refresh token for user ${userId}: ${error.message}`,
          error.stack
        );
      }

      return {
        success: true,
        message: "Password updated successfully",
        status: HttpStatus.OK,
        data: null,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update password for user ${userId}: ${error.message}`,
        error.stack
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ApiException(
        "Failed to update password",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
}
