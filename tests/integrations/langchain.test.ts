/**
 * LangChain.js integration tests.
 *
 * Run with:
 *   npm install langchain @langchain/core
 *   KEYOKU_TEST_API_KEY=your-key npm test -- tests/integrations/langchain.test.ts
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockFetch, mockResponse } from "../setup";

// Reset fetch mock before importing integration
beforeEach(() => {
  mockFetch.mockReset();
});

describe("KeyokuChatMessageHistory", () => {
  it("should be importable", async () => {
    const { KeyokuChatMessageHistory } = await import(
      "../../src/integrations/langchain"
    );
    expect(KeyokuChatMessageHistory).toBeDefined();
  });

  it("should create instance with config", async () => {
    const { KeyokuChatMessageHistory } = await import(
      "../../src/integrations/langchain"
    );

    const history = new KeyokuChatMessageHistory({
      apiKey: "test-key",
      sessionId: "test-session",
    });

    expect(history).toBeDefined();
  });

  it("should get messages", async () => {
    const { KeyokuChatMessageHistory } = await import(
      "../../src/integrations/langchain"
    );

    const history = new KeyokuChatMessageHistory({
      apiKey: "test-key",
      sessionId: "test-session",
    });

    const messages = await history.getMessages();
    expect(Array.isArray(messages)).toBe(true);
  });

  it("should add user message", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ job_id: "job_123", status: "pending" })
    );

    const { KeyokuChatMessageHistory } = await import(
      "../../src/integrations/langchain"
    );

    const history = new KeyokuChatMessageHistory({
      apiKey: "test-key",
      sessionId: "test-session",
    });

    await history.addUserMessage("Hello!");

    const messages = await history.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe("human");
    expect(messages[0].content).toBe("Hello!");
  });

  it("should add AI message", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ job_id: "job_123", status: "pending" })
    );

    const { KeyokuChatMessageHistory } = await import(
      "../../src/integrations/langchain"
    );

    const history = new KeyokuChatMessageHistory({
      apiKey: "test-key",
      sessionId: "test-session",
    });

    await history.addAIMessage("Hello! How can I help?");

    const messages = await history.getMessages();
    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe("ai");
  });

  it("should clear messages", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ job_id: "job_123", status: "pending" })
    );

    const { KeyokuChatMessageHistory } = await import(
      "../../src/integrations/langchain"
    );

    const history = new KeyokuChatMessageHistory({
      apiKey: "test-key",
      sessionId: "test-session",
    });

    await history.addUserMessage("Test");
    await history.clear();

    const messages = await history.getMessages();
    expect(messages).toHaveLength(0);
  });

  it("should store messages to Keyoku", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ job_id: "job_123", status: "pending" })
    );

    const { KeyokuChatMessageHistory } = await import(
      "../../src/integrations/langchain"
    );

    const history = new KeyokuChatMessageHistory({
      apiKey: "test-key",
      sessionId: "session-123",
      agentId: "agent-1",
    });

    await history.addUserMessage("Test message");

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/v1/memories"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("[human]: Test message"),
      })
    );
  });
});

describe("KeyokuMemory", () => {
  it("should be importable", async () => {
    const { KeyokuMemory } = await import("../../src/integrations/langchain");
    expect(KeyokuMemory).toBeDefined();
  });

  it("should create instance with config", async () => {
    const { KeyokuMemory } = await import("../../src/integrations/langchain");

    const memory = new KeyokuMemory({
      apiKey: "test-key",
    });

    expect(memory).toBeDefined();
  });

  it("should have default memory key", async () => {
    const { KeyokuMemory } = await import("../../src/integrations/langchain");

    const memory = new KeyokuMemory({
      apiKey: "test-key",
    });

    expect(memory.memoryVariables).toContain("history");
  });

  it("should support custom memory key", async () => {
    const { KeyokuMemory } = await import("../../src/integrations/langchain");

    const memory = new KeyokuMemory({
      apiKey: "test-key",
      memoryKey: "custom_context",
    });

    expect(memory.memoryVariables).toContain("custom_context");
  });

  it("should load memory variables", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({
        memories: [
          { id: "mem_1", content: "User likes pizza", score: 0.9 },
        ],
        queryTimeMs: 10,
      })
    );

    const { KeyokuMemory } = await import("../../src/integrations/langchain");

    const memory = new KeyokuMemory({
      apiKey: "test-key",
    });

    const loaded = await memory.loadMemoryVariables({ input: "food" });

    expect(loaded).toHaveProperty("history");
    expect(loaded.history).toContain("pizza");
  });

  it("should save context", async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ job_id: "job_123", status: "pending" })
    );

    const { KeyokuMemory } = await import("../../src/integrations/langchain");

    const memory = new KeyokuMemory({
      apiKey: "test-key",
      sessionId: "session-1",
    });

    await memory.saveContext(
      { input: "Hello" },
      { output: "Hi there!" }
    );

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/v1/memories"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Input:"),
      })
    );
  });

  it("should clear memory buffer", async () => {
    const { KeyokuMemory } = await import("../../src/integrations/langchain");

    const memory = new KeyokuMemory({
      apiKey: "test-key",
    });

    await memory.clear();
    // Should not throw
    expect(true).toBe(true);
  });
});
