/**
 * Keyoku SDK Errors
 */

export class KeyokuError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = "KeyokuError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class AuthenticationError extends KeyokuError {
  constructor(message: string = "Invalid API key") {
    super(message, 401, "unauthorized");
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends KeyokuError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "not_found");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends KeyokuError {
  constructor(message: string = "Validation failed") {
    super(message, 400, "validation_error");
    this.name = "ValidationError";
  }
}

export class RateLimitError extends KeyokuError {
  retryAfter?: number;

  constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
    super(message, 429, "rate_limit");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export class ServerError extends KeyokuError {
  constructor(message: string = "Server error") {
    super(message, 500, "server_error");
    this.name = "ServerError";
  }
}
