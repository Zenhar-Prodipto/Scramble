import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersService } from "./services/users.service";
import { UsersRepository } from "./repositories/users.repository";
import { User, UserSchema } from "./schemas/users.schema";

// Module for user-related functionality
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
