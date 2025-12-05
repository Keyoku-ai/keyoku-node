import { describe, it, expect, beforeEach } from "vitest";
import { Keyoku } from "../../src/client";
import { mockFetch, mockResponse, sampleData } from "../setup";

describe("SchemasResource", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("list", () => {
    it("should list schemas", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ schemas: [sampleData.schema] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const schemas = await keyoku.schemas.list();

      expect(schemas).toHaveLength(1);
      expect(schemas[0].id).toBe("sch_123");
      expect(schemas[0].name).toBe("UserPreference");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/schemas"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should convert dates", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ schemas: [sampleData.schema] })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const schemas = await keyoku.schemas.list();

      expect(schemas[0].createdAt).toBeInstanceOf(Date);
      expect(schemas[0].updatedAt).toBeInstanceOf(Date);
    });

    it("should handle empty response", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ schemas: [] }));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const schemas = await keyoku.schemas.list();

      expect(schemas).toEqual([]);
    });
  });

  describe("get", () => {
    it("should get a specific schema", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.schema));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const schema = await keyoku.schemas.get("sch_123");

      expect(schema.id).toBe("sch_123");
      expect(schema.name).toBe("UserPreference");
      expect(schema.description).toBe("Schema for user preferences");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/schemas/sch_123"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should include schema definition", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.schema));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const schema = await keyoku.schemas.get("sch_123");

      expect(schema.schema).toHaveProperty("type", "object");
      expect(schema.schema).toHaveProperty("properties");
    });
  });

  describe("create", () => {
    it("should create a schema", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.schema));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const schema = await keyoku.schemas.create(
        "UserPreference",
        { type: "object", properties: { category: { type: "string" } } },
        "Schema for user preferences"
      );

      expect(schema.name).toBe("UserPreference");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/schemas"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should create schema without description", async () => {
      mockFetch.mockResolvedValueOnce(
        mockResponse({ ...sampleData.schema, description: undefined })
      );

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.schemas.create("TestSchema", { type: "object" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("TestSchema"),
        })
      );
    });
  });

  describe("update", () => {
    it("should update a schema", async () => {
      const updatedSchema = { ...sampleData.schema, name: "UpdatedName" };
      mockFetch.mockResolvedValueOnce(mockResponse(updatedSchema));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const schema = await keyoku.schemas.update("sch_123", {
        name: "UpdatedName",
      });

      expect(schema.name).toBe("UpdatedName");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/schemas/sch_123"),
        expect.objectContaining({ method: "PUT" })
      );
    });

    it("should update schema definition", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.schema));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.schemas.update("sch_123", {
        schema: { type: "object", properties: { newField: { type: "number" } } },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("newField"),
        })
      );
    });

    it("should update description", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.schema));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.schemas.update("sch_123", {
        description: "New description",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining("New description"),
        })
      );
    });
  });

  describe("delete", () => {
    it("should delete a schema", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      await keyoku.schemas.delete("sch_123");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/schemas/sch_123"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
