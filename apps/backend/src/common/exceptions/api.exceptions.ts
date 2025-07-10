import { HttpException, HttpStatus } from "@nestjs/common";
import appConfig from "src/config/appConfig";

export class ApiException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    error?: string,
    details?: Record<string, any>
  ) {
    super(
      {
        success: false,
        message,
        status,
        error: appConfig.env === "production" ? undefined : error,
        ...(details && { details }),
      },
      status
    );
  }
}

export interface ApiSuccess<T> {
  success: boolean;
  message: string;
  status: number;
  data: T;
}
