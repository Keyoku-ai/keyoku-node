import { describe, it, expect, beforeEach } from "vitest";
import { Keyoku } from "../../src/client";
import { mockFetch, mockResponse, sampleData } from "../setup";

describe("GraphResource", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("findPath", () => {
    it("should find path between entities", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          path: true,
          entities: [sampleData.entity],
          relationships: [sampleData.relationship],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const result = await keyoku.graph.findPath("ent_1", "ent_2");

      expect(result).not.toBeNull();
      expect(result?.entities).toHaveLength(1);
      expect(result?.relationships).toHaveLength(1);
      expect(result?.length).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/graph/path"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should return null when no path exists", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          path: false,
          entities: [],
          relationships: [],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const result = await keyoku.graph.findPath("ent_1", "ent_999");

      expect(result).toBeNull();
    });

    it("should send from and to parameters", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          path: false,
          entities: [],
          relationships: [],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.graph.findPath("entity_a", "entity_b");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("from=entity_a"),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("to=entity_b"),
        expect.any(Object)
      );
    });

    it("should support maxDepth option", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          path: false,
          entities: [],
          relationships: [],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.graph.findPath("ent_1", "ent_2", { maxDepth: 3 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("max_depth=3"),
        expect.any(Object)
      );
    });

    it("should support relationshipTypes filter", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          path: false,
          entities: [],
          relationships: [],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.graph.findPath("ent_1", "ent_2", {
        relationshipTypes: ["knows", "works_with"],
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("relationship_types=knows,works_with"),
        expect.any(Object)
      );
    });

    it("should convert entity dates", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          path: true,
          entities: [sampleData.entity],
          relationships: [],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const result = await keyoku.graph.findPath("ent_1", "ent_2");

      expect(result?.entities[0].createdAt).toBeInstanceOf(Date);
      expect(result?.entities[0].updatedAt).toBeInstanceOf(Date);
    });

    it("should convert relationship dates", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          path: true,
          entities: [],
          relationships: [sampleData.relationship],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const result = await keyoku.graph.findPath("ent_1", "ent_2");

      expect(result?.relationships[0].createdAt).toBeInstanceOf(Date);
    });

    it("should use default maxDepth of 5", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({
          path: false,
          entities: [],
          relationships: [],
        })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.graph.findPath("ent_1", "ent_2");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("max_depth=5"),
        expect.any(Object)
      );
    });
  });
});
