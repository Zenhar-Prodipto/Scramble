import { PipeTransform, Injectable, HttpStatus } from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ApiException } from "src/common/exceptions/api.exceptions";

@Injectable()
export class AuthValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: any) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new ApiException(
        "Validation failed",
        HttpStatus.BAD_REQUEST,
        errors
          .map((e) => `${e.property}: ${Object.values(e.constraints || {})}`)
          .join(", ")
      );
    }

    // Validate company for work usageType
    if (value.usageType === "work" && !value.company) {
      throw new ApiException(
        "Company is required for work usage type",
        HttpStatus.BAD_REQUEST
      );
    }
    return object;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
