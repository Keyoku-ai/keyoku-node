import { describe, it, expect, beforeEach } from "vitest";
import { Keyoku } from "../src/client";
import { AuthenticationError, NotFoundError } from "../src/errors";
import { mockFetch, mockResponse, mockErrorResponse } from "./setup";

describe("Keyoku", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("remember", () => {
    it("should create a job", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({ job_id: "job_123", status: "pending" }),
      });

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const job = await keyoku.remember("Test memory content");

      expect(job.jobId).toBe("job_123");
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.keyoku.dev/v1/memories",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-key",
          }),
        })
      );
    });
  });

  describe("search", () => {
    it("should return memories", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            memories: [
              {
                id: "mem_1",
                content: "User likes pizza",
                type: "preference",
                agentId: "default",
                importance: 0.8,
                score: 0.95,
                createdAt: "2024-01-01T00:00:00Z",
              },
            ],
            queryTimeMs: 42,
          }),
      });

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const results = await keyoku.search("food preferences");

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe("User likes pizza");
      expect(results[0].score).toBe(0.95);
    });
  });

  describe("error handling", () => {
    it("should throw AuthenticationError on 401", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          error: { message: "Invalid API key" },
        }),
      });

      const keyoku = new Keyoku({ apiKey: "invalid-key" });

      await expect(keyoku.remember("Test")).rejects.toThrow(
        AuthenticationError
      );
    });

    it("should throw NotFoundError on 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({
          error: { message: "Memory not found" },
        }),
      });

      const keyoku = new Keyoku({ apiKey: "test-key" });

      await expect(keyoku.memories.get("invalid")).rejects.toThrow(
        NotFoundError
      );
    });
  });

  describe("entity ID header", () => {
    it("should send X-Entity-ID header when configured", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({ job_id: "job_123", status: "pending" }),
      });

      const keyoku = new Keyoku({ apiKey: "test-key", entityId: "user-123" });
      await keyoku.remember("Test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Entity-ID": "user-123",
          }),
        })
      );
    });
  });
});
