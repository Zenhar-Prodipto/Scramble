// src/auth/services/auth.service.ts
import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/services/users.service";
import { RedisService } from "src/shared/services/redis_service";
import { EmailService } from "src/shared/services/email_service";
import { ApiException, ApiSuccess } from "src/common/exceptions/api.exceptions";
import { SignupDto } from "../dto/signup.dto";
import { RefreshDto } from "../dto/refresh.dto";
import { SignupResponseData } from "../interfaces/auth.interface";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  async signup(signupDto: SignupDto): Promise<ApiSuccess<SignupResponseData>> {
    try {
      const user = await this.usersService.createUser(signupDto);
      if (!user) {
        throw new ApiException(
          "Failed to create user",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      const { accessToken, refreshToken } = await this.generateTokens(user);
      try {
        await this.redisService.storeRefreshToken(
          user._id.toString(),
          refreshToken
        );
      } catch (error) {
        throw new ApiException(
          "Failed to store refresh token",
          HttpStatus.INTERNAL_SERVER_ERROR,
          error.message
        );
      }
      try {
        await this.emailService.sendWelcomeEmail(user.email, user.name);
      } catch (error) {
        this.logger.error(
          `Failed to queue welcome email: ${error.message}`,
          error.stack
        );
      }
      const data: SignupResponseData = {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          lastLogin: user.lastLogin,
        },
        accessToken,
        refreshToken,
      };
      return {
        success: true,
        message: "User registered successfully",
        status: HttpStatus.CREATED,
        data,
      };
    } catch (error) {
      this.logger.error(
        `Signup failed for ${signupDto.email}: ${error.message}`,
        error.stack
      );
      if (error instanceof HttpException) {
        if (error.getStatus() === HttpStatus.CONFLICT) {
          throw new ApiException(
            "Signup failed: email already taken",
            HttpStatus.CONFLICT,
            error.message
          );
        }
        throw error;
      }
      throw new ApiException(
        "Failed to register user",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  async refreshToken(
    refreshDto: RefreshDto
  ): Promise<ApiSuccess<{ accessToken: string }>> {
    try {
      const storedToken = await this.redisService.getRefreshToken(
        refreshDto.userId
      );
      if (!storedToken || storedToken !== refreshDto.refreshToken) {
        throw new ApiException(
          "Invalid or expired refresh token",
          HttpStatus.UNAUTHORIZED
        );
      }
      const payload = this.jwtService.verify(refreshDto.refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
      });
      const accessToken = this.jwtService.sign(
        { email: payload.email, sub: payload.sub },
        {
          secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
          expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRES_IN"),
        }
      );
      return {
        success: true,
        message: "Access token refreshed",
        status: HttpStatus.OK,
        data: { accessToken },
      };
    } catch (error) {
      this.logger.error(
        `Token refresh failed for user ${refreshDto.userId}: ${error.message}`,
        error.stack
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new ApiException(
        "Failed to refresh token",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }

  private async generateTokens(user: any) {
    const payload = { email: user.email, sub: user._id.toString() };
    const [jwtSecret, refreshSecret, accessExpiry, refreshExpiry] = [
      this.configService.get<string>("JWT_ACCESS_SECRET"),
      this.configService.get<string>("JWT_REFRESH_SECRET"),
      this.configService.get<string>("JWT_ACCESS_EXPIRES_IN"),
      this.configService.get<string>("JWT_REFRESH_EXPIRES_IN"),
    ];
    if (!jwtSecret || !refreshSecret || !accessExpiry || !refreshExpiry) {
      this.logger.error("JWT configuration is incomplete");
      throw new ApiException(
        "JWT configuration is incomplete",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    try {
      const accessToken = this.jwtService.sign(payload, {
        secret: jwtSecret,
        expiresIn: accessExpiry,
      });
      const refreshToken = this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiry,
      });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new ApiException(
        "Failed to generate tokens",
        HttpStatus.INTERNAL_SERVER_ERROR,
        error.message
      );
    }
  }
}
