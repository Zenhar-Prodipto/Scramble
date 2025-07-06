import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../../users/schemas/users.schema";
import { SignupDto } from "../dto/signup.dto";
import { LoginDto } from "../dto/login.dto";
import { JwtService } from "@nestjs/jwt";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { ConfigService } from "@nestjs/config";
import { createClient } from "redis";

// AuthService handles all authentication logic
@Injectable()
export class AuthService {
  private redisClient;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    @InjectQueue("email-queue") private emailQueue: Queue,
    private configService: ConfigService
  ) {
    // Initialize Redis client with config values
    this.redisClient = createClient({
      url: `redis://${this.configService.get(
        "REDIS_HOST"
      )}:${this.configService.get("REDIS_PORT")}`,
    });
    this.redisClient
      .connect()
      .catch((err) => console.error("Redis connection error:", err));
  }

  // Sign up a new user and return tokens
  async signup(signupDto: SignupDto) {
    try {
      const user = await this.userModel.create(signupDto);
      const payload = { email: user.email, sub: user._id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

      // Store refresh token in Redis with 7-day expiration
      await this.redisClient.set(`refresh:${user._id}`, refreshToken, {
        EX: 604800,
      });
      // Add welcome email job to queue
      await this.emailQueue.add("welcome", { to: user.email, name: user.name });

      return {
        success: true,
        data: {
          message: "User registered successfully",
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to register user",
        status: HttpStatus.BAD_REQUEST,
      };
    }
  }

  // Log in a user and return tokens
  async login(loginDto: LoginDto) {
    try {
      const user = await this.userModel.findOne({ email: loginDto.email });
      if (!user) {
        throw new UnauthorizedException("Invalid credentials");
      }

      const bcrypt = await import("bcryptjs");
      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException("Invalid credentials");
      }

      user.lastLogin = new Date();
      await user.save();

      const payload = { email: user.email, sub: user._id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });

      // Store refresh token in Redis
      await this.redisClient.set(`refresh:${user._id}`, refreshToken, {
        EX: 604800,
      });
      // Add login notification job to queue
      await this.emailQueue.add("login", { to: user.email });

      return {
        success: true,
        data: { message: "Login successful", accessToken, refreshToken },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || "Login failed",
        status: HttpStatus.UNAUTHORIZED,
      };
    }
  }

  // Refresh access token using refresh token
  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_SECRET"),
      });
      const storedToken = await this.redisClient.get(`refresh:${payload.sub}`);

      if (storedToken !== refreshToken) {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const newPayload = { email: payload.email, sub: payload.sub };
      const newAccessToken = this.jwtService.sign(newPayload);

      return {
        success: true,
        data: { accessToken: newAccessToken },
      };
    } catch (error) {
      return {
        success: false,
        error: "Invalid or expired refresh token",
        status: HttpStatus.UNAUTHORIZED,
      };
    }
  }
}
