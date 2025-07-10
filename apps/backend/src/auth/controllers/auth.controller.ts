import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  Request,
} from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { SignupDto } from "../dto/signup.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthValidationPipe } from "../pipes/auth-validation.pipe";
import { Public } from "../../common/decorators/public.decorators";
import { RefreshDto } from "../dto/refresh.dto";
import { ApiException } from "src/common/exceptions/api.exceptions";
import { LoginDto } from "../dto/login.dto";

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

  // Login endpoint with rate limiting and validation
  @Public()
  @Throttle({ login: { limit: 5, ttl: 3600000 } }) // 5 attempts per hour
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @UsePipes(AuthValidationPipe)
  @ApiOperation({ summary: "Login a user" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "User logged in successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input",
    type: ApiException,
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
    type: ApiException,
  })
  @ApiResponse({
    status: 429,
    description: "Too many login attempts",
    type: ApiException,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ApiException,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Logout endpoint with rate limiting
  @Post("me/logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout the authenticated user" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "User logged out successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: ApiException,
  })
  @ApiResponse({
    status: 429,
    description: "Too many logout attempts",
    type: ApiException,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ApiException,
  })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user.sub);
  }

  //refresh endpoint to get a new access token using a refresh token

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
}
