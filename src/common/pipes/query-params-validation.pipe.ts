import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common"
import { plainToInstance } from "class-transformer"
import { validate, ValidationError } from "class-validator"
import { validationExceptionFactory } from "../utils/validation-exception.factory"

@Injectable()
export class QueryParamsValidationPipe implements PipeTransform {
  async transform(
    params: Record<string, string>,
    { metatype }: ArgumentMetadata,
  ) {
    if (!metatype) return params

    const dto = plainToInstance(metatype, params)

    const errors: ValidationError[] = await validate(dto, {
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: false,
      whitelist: true,
    })

    if (errors.length > 0) {
      throw validationExceptionFactory(errors)
    }

    return dto
  }
}
