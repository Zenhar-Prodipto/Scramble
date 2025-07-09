import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { SignupDto } from "../dto/signup.dto";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthValidationPipe } from "../pipes/auth-validation.pipe";
import { Public } from "../../common/decorators/public.decorators";
import { RefreshDto } from "../dto/refresh.dto";
import { ApiException } from "src/common/exceptions/api.exceptions";

// AuthController handles all authentication-related routes
@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // Signup endpoint with rate limiting and validation
  @Public()
  @Throttle({ signup: { limit: 3, ttl: 3600000 } }) // 3 attempts per hour
  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(AuthValidationPipe)
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: "User registered successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input",
    type: ApiException,
  })
  @ApiResponse({
    status: 409,
    description: "Email already exists",
    type: ApiException,
  })
  @ApiResponse({
    status: 429,
    description: "Too many signup attempts",
    type: ApiException,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ApiException,
  })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @UsePipes(AuthValidationPipe)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: "Access token refreshed",
  })
  @ApiResponse({
    status: 401,
    description: "Invalid refresh token",
    type: ApiException,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ApiException,
  })
  async refresh(@Body() refreshDto: RefreshDto) {
    return this.authService.refreshToken(refreshDto);
  }

  // // Handle user login with HTTP 200 status
  // @Post("login")
  // @HttpCode(HttpStatus.OK)
  // async login(@Body() loginDto: LoginDto) {
  //   return this.authService.login(loginDto);
  // }

  // // Handle token refresh with HTTP 200 status
  // @Post("refresh")
  // @HttpCode(HttpStatus.OK)
  // async refresh(@Body() refreshDto: RefreshDto) {
  //   return this.authService.refresh(refreshDto.refreshToken);
  // }
}
