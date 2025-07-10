import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersService } from "./services/users.service";
import { UsersRepository } from "./repositories/users.repository";
import { User, UserSchema } from "./schemas/users.schema";
import { use } from "passport";
import { SharedModule } from "src/shared/shared.module";
import { JwtModule } from "@nestjs/jwt";
import { UsersController } from "./controllers/users.controller";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/auth/auth.module";

// Module for user-related functionality
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
    SharedModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        // No global secret needed; AuthService uses specific secrets
      }),
      inject: [],
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
