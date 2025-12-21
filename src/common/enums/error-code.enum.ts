export enum ErrorCode {
  // === 400 Bad Request ===
  VALIDATION_ERROR = "VALIDATION_ERROR",

  // === 401 Unauthorized ===
  UNMATCHED_CREDENTIALS = "UNMATCHED_CREDENTIALS",

  // === 404 Not Found ===
  USER_NOT_FOUND = "USER_NOT_FOUND",

  // === 500 ===
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
