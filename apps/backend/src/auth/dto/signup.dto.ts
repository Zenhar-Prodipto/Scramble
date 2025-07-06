import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
} from "class-validator";

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: "Password must be at least 8 characters with letters and numbers",
  })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsEnum(["male", "female", "other"])
  gender: string;

  @IsEnum(["personal", "work"])
  @IsOptional()
  usageType?: string;

  @IsNotEmpty()
  @IsOptional()
  company?: string;
}
