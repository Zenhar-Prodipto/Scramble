import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "../../users/services/users.service";
import { RedisService } from "../../shared/services/redis_service";
import { EmailService } from "../../shared/services/email_service";
import {
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
} from "@nestjs/common";
import { Gender, SignupDto, UsageType } from "../dto/signup.dto";

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let redisService: jest.Mocked<RedisService>;
  let emailService: jest.Mocked<EmailService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue("access-token"),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue("your-refresh-secret"),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: RedisService,
          useValue: {
            storeRefreshToken: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    redisService = module.get(RedisService);
    emailService = module.get(EmailService);
    jwtService = module.get(JwtService);
  });

  describe("signup", () => {
    const signupDto: SignupDto = {
      email: "test@example.com",
      password: "Password123!",
      name: "John Doe",
      gender: Gender.MALE,
      usageType: UsageType.PERSONAL,
    };

    it("should successfully register a user", async () => {
      usersService.createUser.mockResolvedValue({
        _id: "1",
        email: "test@example.com",
        name: "John Doe",
        lastLogin: new Date(),
      } as any);
      redisService.storeRefreshToken.mockResolvedValue();
      emailService.sendWelcomeEmail.mockResolvedValue();
      jwtService.sign
        .mockReturnValueOnce("access-token")
        .mockReturnValueOnce("refresh-token");

      const result = await service.signup(signupDto);

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.data.user.email).toBe("test@example.com");
      expect(result.data.accessToken).toBe("access-token");
      expect(result.data.refreshToken).toBe("refresh-token");
      expect(usersService.createUser).toHaveBeenCalledWith(signupDto);
      expect(redisService.storeRefreshToken).toHaveBeenCalledWith(
        "1",
        "refresh-token"
      );
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        "test@example.com",
        "John Doe"
      );
    });

    it("should throw BadRequestException for duplicate email", async () => {
      usersService.createUser.mockRejectedValue({ code: 11000 });

      await expect(service.signup(signupDto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.signup(signupDto)).rejects.toMatchObject({
        response: {
          success: false,
          message: "Email already exists",
          status: HttpStatus.CONFLICT,
        },
      });
    });

    it("should throw InternalServerErrorException for Redis failure", async () => {
      usersService.createUser.mockResolvedValue({
        _id: "1",
        email: "test@example.com",
        name: "John Doe",
        lastLogin: new Date(),
      } as any);
      redisService.storeRefreshToken.mockRejectedValue(
        new Error("Redis error")
      );

      await expect(service.signup(signupDto)).rejects.toThrow(
        InternalServerErrorException
      );
      await expect(service.signup(signupDto)).rejects.toMatchObject({
        response: {
          success: false,
          message: "Failed to store refresh token",
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      });
    });
  });
});
