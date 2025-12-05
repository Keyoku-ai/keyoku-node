import { describe, it, expect, beforeEach } from "vitest";
import { Keyoku } from "../../src/client";
import { mockFetch, mockResponse, sampleData } from "../setup";

describe("RelationshipsResource", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("list", () => {
    it("should list relationships", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ relationships: [sampleData.relationship] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const relationships = await keyoku.relationships.list();

      expect(relationships).toHaveLength(1);
      expect(relationships[0].id).toBe("rel_123");
      expect(relationships[0].type).toBe("knows");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/relationships"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should support pagination options", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ relationships: [] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.relationships.list({ limit: 20, offset: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=20"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("offset=10"),
        expect.any(Object)
      );
    });

    it("should filter by type", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ relationships: [] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.relationships.list({ type: "works_at" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("type=works_at"),
        expect.any(Object)
      );
    });

    it("should convert dates", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ relationships: [sampleData.relationship] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const relationships = await keyoku.relationships.list();

      expect(relationships[0].createdAt).toBeInstanceOf(Date);
    });

    it("should handle empty response", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ relationships: [] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const relationships = await keyoku.relationships.list();

      expect(relationships).toEqual([]);
    });
  });

  describe("get", () => {
    it("should get a specific relationship", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.relationship));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const relationship = await keyoku.relationships.get("rel_123");

      expect(relationship.id).toBe("rel_123");
      expect(relationship.sourceId).toBe("ent_1");
      expect(relationship.targetId).toBe("ent_2");
      expect(relationship.type).toBe("knows");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/relationships/rel_123"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should include properties", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.relationship));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const relationship = await keyoku.relationships.get("rel_123");

      expect(relationship.properties.since).toBe("2020");
    });
  });
});
