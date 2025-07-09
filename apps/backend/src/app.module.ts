// src/app.module.ts
import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule } from "@nestjs/throttler";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { Reflector } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { SharedModule } from "./shared/shared.module";
import { AppController } from "./app.controller";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        // No global secret needed; AuthService uses specific secrets
      }),
      inject: [],
    }),
    ThrottlerModule.forRoot([
      {
        name: "signup",
        ttl: 3600000,
        limit: 3,
      },
    ]),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || "mongodb://mongo:27017/scramble",
      }),
    }),
    AuthModule,
    UsersModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [
    Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
