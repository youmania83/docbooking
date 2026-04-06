/**
 * Application Error Classes
 */

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details?: Record<string, string>) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string, public service: string) {
    super(message, 503, "EXTERNAL_SERVICE_ERROR");
    this.name = "ExternalServiceError";
  }
}

/**
 * Error handling utility
 */
export function isAppError(
  error: unknown
): error is AppError & { statusCode: number; code: string } {
  return error instanceof AppError;
}

export function handleError(
  error: unknown
): { statusCode: number; message: string; code: string } {
  if (isAppError(error)) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    console.error("Unhandled error:", error.message);
    return {
      statusCode: 500,
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    };
  }

  console.error("Unknown error:", error);
  return {
    statusCode: 500,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  };
}
