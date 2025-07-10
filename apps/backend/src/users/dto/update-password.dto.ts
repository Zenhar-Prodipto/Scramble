import { IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePasswordDto {
  @ApiProperty({
    example: "oldPass123!",
    description: "Current password of the user",
    required: true,
  })
  @IsString()
  @MinLength(8, { message: "Old password must be at least 8 characters long" })
  oldPassword: string;

  @ApiProperty({
    example: "newPass123!",
    description: "New password for the user",
    required: true,
  })
  @IsString()
  @MinLength(8, { message: "New password must be at least 8 characters long" })
  newPassword: string;
}
