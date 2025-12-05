import { describe, it, expect, beforeEach } from "vitest";
import { Keyoku } from "../src/client";
import {
  KeyokuError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from "../src/errors";
import { mockFetch, mockErrorResponse } from "./setup";

describe("Errors", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("KeyokuError", () => {
    it("should have correct properties", () => {
      const error = new KeyokuError("Test error", 500, "test_code");

      expect(error.message).toBe("Test error");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("test_code");
      expect(error.name).toBe("KeyokuError");
    });

    it("should be an instance of Error", () => {
      const error = new KeyokuError("Test");
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe("AuthenticationError", () => {
    it("should have correct defaults", () => {
      const error = new AuthenticationError();

      expect(error.message).toBe("Invalid API key");
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe("unauthorized");
      expect(error.name).toBe("AuthenticationError");
    });

    it("should accept custom message", () => {
      const error = new AuthenticationError("Custom auth error");
      expect(error.message).toBe("Custom auth error");
    });

    it("should be thrown on 401 response", async () => {
      mockFetch.mockResolvedValueOnce(
        mockErrorResponse(401, "Invalid API key")
      );

      const keyoku = new Keyoku({ apiKey: "invalid-key" });

      await expect(keyoku.remember("Test")).rejects.toThrow(AuthenticationError);
    });
  });

  describe("NotFoundError", () => {
    it("should have correct defaults", () => {
      const error = new NotFoundError();

      expect(error.message).toBe("Resource not found");
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe("not_found");
      expect(error.name).toBe("NotFoundError");
    });

    it("should be thrown on 404 response", async () => {
      mockFetch.mockResolvedValueOnce(
        mockErrorResponse(404, "Memory not found")
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });

      await expect(keyoku.memories.get("invalid")).rejects.toThrow(NotFoundError);
    });
  });

  describe("ValidationError", () => {
    it("should have correct defaults", () => {
      const error = new ValidationError();

      expect(error.message).toBe("Validation failed");
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe("validation_error");
      expect(error.name).toBe("ValidationError");
    });

    it("should be thrown on 400 response", async () => {
      mockFetch.mockResolvedValueOnce(
        mockErrorResponse(400, "Invalid request body")
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });

      await expect(keyoku.remember("")).rejects.toThrow(ValidationError);
    });
  });

  describe("RateLimitError", () => {
    it("should have correct defaults", () => {
      const error = new RateLimitError();

      expect(error.message).toBe("Rate limit exceeded");
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe("rate_limit");
      expect(error.name).toBe("RateLimitError");
      expect(error.retryAfter).toBeUndefined();
    });

    it("should accept retryAfter parameter", () => {
      const error = new RateLimitError("Too many requests", 60);

      expect(error.message).toBe("Too many requests");
      expect(error.retryAfter).toBe(60);
    });

    it("should be thrown on 429 response", async () => {
      mockFetch.mockResolvedValueOnce(
        mockErrorResponse(429, "Rate limit exceeded")
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });

      await expect(keyoku.remember("Test")).rejects.toThrow(RateLimitError);
    });
  });

  describe("ServerError", () => {
    it("should have correct defaults", () => {
      const error = new ServerError();

      expect(error.message).toBe("Server error");
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe("server_error");
      expect(error.name).toBe("ServerError");
    });

    it("should be thrown on 500 response", async () => {
      mockFetch.mockResolvedValueOnce(
        mockErrorResponse(500, "Internal server error")
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });

      await expect(keyoku.remember("Test")).rejects.toThrow(ServerError);
    });
  });

  describe("Error inheritance", () => {
    it("AuthenticationError extends KeyokuError", () => {
      const error = new AuthenticationError();
      expect(error).toBeInstanceOf(KeyokuError);
    });

    it("NotFoundError extends KeyokuError", () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(KeyokuError);
    });

    it("ValidationError extends KeyokuError", () => {
      const error = new ValidationError();
      expect(error).toBeInstanceOf(KeyokuError);
    });

    it("RateLimitError extends KeyokuError", () => {
      const error = new RateLimitError();
      expect(error).toBeInstanceOf(KeyokuError);
    });

    it("ServerError extends KeyokuError", () => {
      const error = new ServerError();
      expect(error).toBeInstanceOf(KeyokuError);
    });
  });
});
