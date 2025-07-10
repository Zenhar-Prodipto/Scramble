// src/auth/dto/refresh.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty } from "class-validator";

export class RefreshDto {
  @ApiProperty({ example: "1", description: "User ID" })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    description: "Refresh token",
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
