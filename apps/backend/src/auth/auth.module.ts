// import { Module } from "@nestjs/common";
// import { MongooseModule } from "@nestjs/mongoose";
// import { JwtModule } from "@nestjs/jwt";
// import { ConfigModule, ConfigService } from "@nestjs/config";
// import { ThrottlerModule } from "@nestjs/throttler";
// import { AuthController } from "./controllers/auth.controller";
// import { AuthService } from "./services/auth.service";
// import { UsersModule } from "../users/users.module";
// import { SharedModule } from "../shared/shared.module";
// import { User, UserSchema } from "../users/schemas/users.schema";

// // Module for authentication-related functionality
// @Module({
//   imports: [
//     MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => ({
//         secret: configService.get<string>("JWT_SECRET", "your-secret-key"),
//         signOptions: {
//           expiresIn: configService.get<string>("JWT_EXPIRES_IN", "15m"),
//         },
//       }),
//       inject: [ConfigService],
//     }),
//     ThrottlerModule.forRoot([
//       {
//         name: "signup",
//         ttl: 3600000, // 1 hour
//         limit: 3, // 3 attempts per IP
//       },
//     ]),
//     UsersModule, // Import UsersModule for UsersService
//     SharedModule, // Import SharedModule for RedisService and EmailService
//   ],
//   controllers: [AuthController],
//   providers: [AuthService],
//   exports: [AuthService, JwtModule],
// })
// export class AuthModule {}

// src/auth/auth.module.ts
import { Module } from "@nestjs/common";
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
    UsersModule,
    SharedModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
