import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  MinLength,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Gender, UsageType } from "../schemas/users.schema";

// Custom validator for company when usageType is work
export function IsCompanyRequiredForWork(
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isCompanyRequiredForWork",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const usageType = (args.object as any).usageType;
          if (usageType === "work" && !value) {
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return "Company is required when usageType is work";
        },
      },
    });
  };
}

//DTO for updating user profile
export class UpdateUserDto {
  @ApiProperty({
    example: "Jane Doe",
    description: "User's full name",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "Name must be at least 2 characters long" })
  name?: string;

  @ApiProperty({
    example: Gender.FEMALE,
    description: "User's gender",
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender, { message: "Gender must be one of: male, female, other" })
  gender?: Gender;

  @ApiProperty({
    example: "https://example.com/avatar.jpg",
    description: "URL to user's avatar image",
    required: false,
  })
  @IsOptional()
  @IsUrl({}, { message: "Avatar must be a valid URL" })
  avatar?: string;

  @ApiProperty({
    example: UsageType.WORK,
    description: "Account type (personal or work)",
    enum: UsageType,
    required: false,
  })
  @IsOptional()
  @IsEnum(UsageType, { message: "Usage type must be personal or work" })
  usageType?: UsageType;

  @ApiProperty({
    example: "Acme Corp",
    description: "Company name, required if usageType is work",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsCompanyRequiredForWork()
  company?: string;
}
