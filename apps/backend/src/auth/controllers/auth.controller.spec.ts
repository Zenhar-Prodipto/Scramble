import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "../services/auth.service";
import { HttpStatus } from "@nestjs/common";
import { Gender, SignupDto, UsageType } from "../dto/signup.dto";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
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
      authService.signup.mockResolvedValue({
        success: true,
        message: "User registered successfully",
        status: HttpStatus.CREATED,
        data: {
          user: {
            id: "1",
            email: "test@example.com",
            name: "John Doe",
            lastLogin: new Date(),
          },
          accessToken: "access-token",
          refreshToken: "refresh-token",
        },
      });

      const result = await controller.signup(signupDto);

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.CREATED);
      expect(result.data.user.email).toBe("test@example.com");
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });
  });
});
