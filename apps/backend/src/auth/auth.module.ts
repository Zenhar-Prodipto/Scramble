// src/auth/auth.module.ts
import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UsersModule } from "../users/users.module";
import { SharedModule } from "../shared/shared.module";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        // No global secret needed; AuthService uses specific secrets
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => UsersModule),
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
