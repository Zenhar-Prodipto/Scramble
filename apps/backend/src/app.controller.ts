import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RedisService } from "./shared/services/redis_service";
import { Public } from "./common/decorators/public.decorators";

// Root controller for health check and Redis debug
@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly redisService: RedisService) {}

  @Public()
  @Get("health")
  @ApiOperation({ summary: "Check API health" })
  @ApiResponse({ status: 200, description: "API is healthy" })
  async healthCheck() {
    const isRedisAvailable = await this.redisService.isRedisAvailable();
    return {
      success: true,
      message: "API is healthy",
      status: HttpStatus.OK,
      data: {
        redis: isRedisAvailable
          ? "connected"
          : "disconnected (using in-memory)",
      },
    };
  }
}
