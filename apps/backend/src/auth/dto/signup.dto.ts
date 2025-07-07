//

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

export class SignupDto {
  @IsEmail({}, { message: "Please provide a valid email" })
  @IsNotEmpty({ message: "Email is required" })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: "Password must contain at least one letter and one number",
  })
  password: string;

  @IsNotEmpty({ message: "Name is required" })
  @MinLength(2, { message: "Name must be at least 2 characters" })
  @MaxLength(50, { message: "Name cannot exceed 50 characters" })
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEnum(["male", "female", "other"], {
    message: "Gender must be male, female, or other",
  })
  gender: string;

  @IsEnum(["personal", "work"], {
    message: "Usage type must be personal or work",
  })
  @IsOptional()
  usageType?: string;

  @IsOptional()
  company?: string;
}
