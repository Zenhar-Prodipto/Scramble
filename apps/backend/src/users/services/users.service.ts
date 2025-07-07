import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { UsersRepository } from "../repositories/users.repository";
import { SignupDto } from "../../auth/dto/signup.dto";
import { User } from "../schemas/users.schema";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<User | null> {
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    return existingUser;
  }

  async createUser(signupDto: SignupDto): Promise<User> {
    try {
      return this.usersRepository.create(signupDto);
    } catch (error) {
      throw new Error("Failed to create user");
    }
  }
}
