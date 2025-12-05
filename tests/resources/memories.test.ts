import { describe, it, expect, beforeEach } from "vitest";
import { Keyoku } from "../../src/client";
import { mockFetch, mockResponse, sampleData } from "../setup";

describe("MemoriesResource", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("list", () => {
    it("should list memories", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          memories: [sampleData.memory],
          total: 1,
          hasMore: false,
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const result = await keyoku.memories.list();

      expect(result.memories).toHaveLength(1);
      expect(result.memories[0].id).toBe("mem_123");
      expect(result.total).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/memories"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should support pagination options", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          memories: [],
          total: 100,
          hasMore: true,
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.memories.list({ limit: 10, offset: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("offset=20"),
        expect.any(Object)
      );
    });

    it("should filter by agent ID", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          memories: [],
          total: 0,
          hasMore: false,
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.memories.list({ agentId: "agent-1" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("agent_id=agent-1"),
        expect.any(Object)
      );
    });
  });

  describe("get", () => {
    it("should get a specific memory", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.memory));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const memory = await keyoku.memories.get("mem_123");

      expect(memory.id).toBe("mem_123");
      expect(memory.content).toBe("User likes pizza");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/memories/mem_123"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should convert createdAt to Date", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.memory));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const memory = await keyoku.memories.get("mem_123");

      expect(memory.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("delete", () => {
    it("should delete a memory", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.memories.delete("mem_123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/memories/mem_123"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("deleteAll", () => {
    it("should delete all memories", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.memories.deleteAll();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/memories"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });

  describe("batchCreate", () => {
    it("should create memories in batch", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ jobId: "job_123" }));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const result = await keyoku.memories.batchCreate([
        "Memory 1",
        "Memory 2",
      ]);

      expect(result.jobId).toBe("job_123");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/memories/batch"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should support session and agent options", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ jobId: "job_123" }));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.memories.batchCreate(["Test"], {
        sessionId: "sess_1",
        agentId: "agent_1",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("sess_1"),
        })
      );
    });
  });

  describe("batchDelete", () => {
    it("should delete memories in batch", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.memories.batchDelete(["mem_1", "mem_2"]);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/memories/batch"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
