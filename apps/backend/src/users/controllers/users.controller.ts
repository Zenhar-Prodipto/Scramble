import {
  Controller,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Request,
  UsePipes,
} from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { UpdateUserDto } from "../dto/update-user.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { AuthValidationPipe } from "../../auth/pipes/auth-validation.pipe";
import {
  ApiException,
  ApiSuccess,
} from "../../common/exceptions/api.exceptions";
import { UserResponseData } from "../interfaces/users.interface";

// UsersController handles user-related routes
@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Get authenticated user's profile
  @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 requests per hour
  @Get("me")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get authenticated user's profile" })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: ApiException,
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    type: ApiException,
  })
  @ApiResponse({
    status: 429,
    description: "Too many requests",
    type: ApiException,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ApiException,
  })
  async getProfile(@Request() req: any): Promise<ApiSuccess<UserResponseData>> {
    return this.usersService.getProfile(req.user.sub);
  }

  // Update authenticated user's profile
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 requests per hour
  @Patch("me")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update authenticated user's profile" })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: "User profile updated successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid input",
    type: ApiException,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized",
    type: ApiException,
  })
  @ApiResponse({
    status: 404,
    description: "User not found",
    type: ApiException,
  })
  @ApiResponse({
    status: 429,
    description: "Too many requests",
    type: ApiException,
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
    type: ApiException,
  })
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<ApiSuccess<UserResponseData>> {
    return this.usersService.updateProfile(req.user.sub, updateUserDto);
  }
}
