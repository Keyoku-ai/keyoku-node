import { describe, it, expect, beforeEach } from "vitest";
import { Keyoku } from "../../src/client";
import { mockFetch, mockResponse, sampleData } from "../setup";

describe("EntitiesResource", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("list", () => {
    it("should list entities", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          entities: [sampleData.entity],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const entities = await keyoku.entities.list();

      expect(entities).toHaveLength(1);
      expect(entities[0].id).toBe("ent_123");
      expect(entities[0].name).toBe("John Doe");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/entities"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should support pagination and type filter", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ entities: [] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.entities.list({ limit: 10, offset: 5, type: "person" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=10"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("type=person"),
        expect.any(Object)
      );
    });

    it("should convert dates", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ entities: [sampleData.entity] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const entities = await keyoku.entities.list();

      expect(entities[0].createdAt).toBeInstanceOf(Date);
      expect(entities[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("search", () => {
    it("should search entities by name", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ entities: [sampleData.entity] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const results = await keyoku.entities.search("John");

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("John Doe");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/entities/search"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("query=John"),
        expect.any(Object)
      );
    });

    it("should support search options", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ entities: [] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.entities.search("test", { limit: 5, type: "company" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("limit=5"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("type=company"),
        expect.any(Object)
      );
    });
  });

  describe("get", () => {
    it("should get a specific entity", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.entity));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const entity = await keyoku.entities.get("ent_123");

      expect(entity.id).toBe("ent_123");
      expect(entity.properties.age).toBe(30);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/entities/ent_123"),
        expect.objectContaining({ method: "GET" })
      );
    });
  });

  describe("relationships", () => {
    it("should get entity relationships", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ relationships: [sampleData.relationship] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const relationships = await keyoku.entities.relationships("ent_123");

      expect(relationships).toHaveLength(1);
      expect(relationships[0].type).toBe("knows");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/entities/ent_123/relationships"),
        expect.any(Object)
      );
    });

    it("should support direction and type filters", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ relationships: [] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.entities.relationships("ent_123", {
        direction: "outgoing",
        type: "works_at",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("direction=outgoing"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("type=works_at"),
        expect.any(Object)
      );
    });

    it("should convert relationship dates", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ relationships: [sampleData.relationship] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const relationships = await keyoku.entities.relationships("ent_123");

      expect(relationships[0].createdAt).toBeInstanceOf(Date);
    });
  });
});
