import { BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

const formatValidationErrors = (
  errors: ValidationError[],
  parentField?: string,
) => {
  const formattedErrors: { field: string; message: string }[] = [];
  errors.forEach((error) => {
    const currentField = parentField
      ? `${parentField}.${error.property}`
      : error.property;
    if (error.constraints) {
      formattedErrors.push({
        field: currentField,
        message: Object.values(error.constraints)[0],
      });
    }

    if (error.children && error.children.length > 0) {
      formattedErrors.push(
        ...formatValidationErrors(error.children, currentField),
      );
    }
  });
  return formattedErrors;
};

export const validationExceptionFactory = (errors: ValidationError[]) => {
  const formattedErrors = formatValidationErrors(errors);

  return new BadRequestException({
    message: "Invalid input format",
    errorCode: "VALIDATION_ERROR",
    errors: formattedErrors,
  });
};
