import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BullModule } from "@nestjs/bull";
import { RedisService } from "./services/redis_service";
import { EmailService } from "./services/email_service";
import appConfig from "src/config/appConfig";

// Shared module for cross-cutting services
@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      redis: {
        host: appConfig.redis.host,
        port: appConfig.redis.port,
        password: appConfig.redis.password,
      },
    }),
    BullModule.registerQueue({
      name: "email",
    }),
  ],
  providers: [RedisService, EmailService],
  exports: [RedisService, EmailService],
})
export class SharedModule {}
