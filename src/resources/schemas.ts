/**
 * Schemas Resource
 */

import type { Keyoku } from "../client";
import type { Schema } from "../types";

export class SchemasResource {
  constructor(private client: Keyoku) {}

  /**
   * List all schemas.
   */
  async list(): Promise<Schema[]> {
    const response = await this.client.request<{ schemas: Schema[] }>(
      "GET",
      "/v1/schemas"
    );
    return (response.schemas || []).map((s) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  }

  /**
   * Get a specific schema by ID.
   */
  async get(schemaId: string): Promise<Schema> {
    const response = await this.client.request<Schema>(
      "GET",
      `/v1/schemas/${schemaId}`
    );
    return {
      ...response,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  /**
   * Create a new schema.
   */
  async create(
    name: string,
    schema: Record<string, unknown>,
    description?: string
  ): Promise<Schema> {
    const response = await this.client.request<Schema>("POST", "/v1/schemas", {
      json: { name, schema, description },
    });
    return {
      ...response,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  /**
   * Update an existing schema.
   */
  async update(
    schemaId: string,
    updates: {
      name?: string;
      schema?: Record<string, unknown>;
      description?: string;
    }
  ): Promise<Schema> {
    const response = await this.client.request<Schema>(
      "PUT",
      `/v1/schemas/${schemaId}`,
      { json: updates }
    );
    return {
      ...response,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  /**
   * Delete a schema.
   */
  async delete(schemaId: string): Promise<void> {
    await this.client.request("DELETE", `/v1/schemas/${schemaId}`);
  }
}
