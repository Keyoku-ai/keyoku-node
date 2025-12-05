/**
 * Vercel AI SDK integration tests.
 *
 * Run with:
 *   npm install ai
 *   KEYOKU_TEST_API_KEY=your-key npm test -- tests/integrations/vercel-ai.test.ts
 */

import { describe, it, expect, beforeEach } from "vitest";
import { mockFetch, mockResponse, sampleData } from "../setup";

// Reset fetch mock before tests
beforeEach(() => {
  mockFetch.mockReset();
});

describe("createKeyokuMemory", () => {
  it("should be importable", async () => {
    const { createKeyokuMemory } = await import(
      "../../src/integrations/vercel-ai"
    );
    expect(createKeyokuMemory).toBeDefined();
  });

  it("should create memory helper", async () => {
    const { createKeyokuMemory } = await import(
      "../../src/integrations/vercel-ai"
    );

    const memory = createKeyokuMemory({
      apiKey: "test-key",
    });

    expect(memory).toBeDefined();
    expect(memory.remember).toBeDefined();
    expect(memory.search).toBeDefined();
    expect(memory.getContext).toBeDefined();
    expect(memory.saveConversation).toBeDefined();
    expect(memory.client).toBeDefined();
  });

  describe("remember", () => {
    it("should store memory and wait for completion", async () => {
      // Mock the remember call
      mockFetch.mockResolvedValueOnce(
        mockResponse({ job_id: "job_123", status: "pending" })
      );
      // Mock the job polling
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          id: "job_123",
          status: "completed",
          createdAt: "2024-01-01T00:00:00Z",
          completedAt: "2024-01-01T00:00:01Z",
        })
      );

      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
      });

      await memory.remember("User prefers dark mode");

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("/v1/memories"),
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("search", () => {
    it("should search memories and return formatted results", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          memories: [
            { ...sampleData.memoryWithScore, content: "User likes Python" },
            { ...sampleData.memoryWithScore, content: "User knows TypeScript" },
          ],
          queryTimeMs: 15,
        })
      );

      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
      });

      const result = await memory.search("programming languages");

      expect(result.memories).toHaveLength(2);
      expect(result.formatted).toContain("Python");
      expect(result.formatted).toContain("TypeScript");
    });

    it("should support custom limit", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ memories: [], queryTimeMs: 5 })
      );

      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
      });

      await memory.search("test", 3);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=3"),
        expect.any(Object)
      );
    });
  });

  describe("getContext", () => {
    it("should return formatted context string", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          memories: [
            { ...sampleData.memoryWithScore, content: "User is a developer" },
          ],
          queryTimeMs: 10,
        })
      );

      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
      });

      const context = await memory.getContext("profession");

      expect(context).toContain("Relevant context from memory:");
      expect(context).toContain("developer");
    });

    it("should return empty string when no memories found", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ memories: [], queryTimeMs: 5 })
      );

      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
      });

      const context = await memory.getContext("unknown topic");

      expect(context).toBe("");
    });
  });

  describe("saveConversation", () => {
    it("should save user and assistant messages", async () => {
      // Mock remember call
      mockFetch.mockResolvedValueOnce(
        mockResponse({ job_id: "job_123", status: "pending" })
      );
      // Mock job completion
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          id: "job_123",
          status: "completed",
          createdAt: "2024-01-01T00:00:00Z",
          completedAt: "2024-01-01T00:00:01Z",
        })
      );

      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
      });

      await memory.saveConversation(
        "What is the weather?",
        "It's sunny today!"
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/memories"),
        expect.objectContaining({
          body: expect.stringContaining("User: What is the weather?"),
        })
      );
    });
  });

  describe("client access", () => {
    it("should expose underlying Keyoku client", async () => {
      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
        baseUrl: "http://localhost:8000",
      });

      expect(memory.client).toBeDefined();
    });
  });

  describe("configuration", () => {
    it("should pass sessionId to client", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ job_id: "job_123", status: "pending" })
      );
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          id: "job_123",
          status: "completed",
          createdAt: "2024-01-01T00:00:00Z",
        })
      );

      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
        sessionId: "session-abc",
      });

      await memory.remember("Test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("session-abc"),
        })
      );
    });

    it("should pass agentId to client", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          memories: [],
          queryTimeMs: 5,
        })
      );

      const { createKeyokuMemory } = await import(
        "../../src/integrations/vercel-ai"
      );

      const memory = createKeyokuMemory({
        apiKey: "test-key",
        agentId: "my-agent",
      });

      await memory.search("test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("agent_id=my-agent"),
        expect.any(Object)
      );
    });
  });
});

describe("KeyokuMemoryHelper type", () => {
  it("should export KeyokuMemoryHelper type", async () => {
    const module = await import("../../src/integrations/vercel-ai");
    // TypeScript type check - if this compiles, the type is exported
    expect(module.createKeyokuMemory).toBeDefined();
  });
});
