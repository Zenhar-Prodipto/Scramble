import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

// Enums for reuse
export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum UsageType {
  PERSONAL = "personal",
  WORK = "work",
}

// DTO for user signup
export class SignupDto {
  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail({}, { message: "Please provide a valid email" })
  @IsNotEmpty({ message: "Email is required" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: "Password123!", description: "User password" })
  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: "Password must contain at least one letter and one number",
  })
  password: string;

  @ApiProperty({ example: "John Doe", description: "User name" })
  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters" })
  @MaxLength(50, { message: "Name cannot exceed 50 characters" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ enum: Gender, description: "User gender" })
  @IsEnum(Gender, { message: "Gender must be male, female, or other" })
  gender: Gender;

  @ApiProperty({ enum: UsageType, description: "Usage type (optional)" })
  @IsEnum(UsageType, { message: "Usage type must be personal or work" })
  @IsOptional()
  usageType?: UsageType;

  @ApiProperty({
    example: "Acme Corp",
    description: "Company name (required for work usage)",
  })
  @IsOptional()
  company?: string;
}
