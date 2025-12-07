/**
 * Entities Resource
 */

import type { Keyoku } from "../client";
import type {
  Entity,
  Relationship,
  EntityListOptions,
  EntitySearchOptions,
  RelationshipOptions,
} from "../types";

export class EntitiesResource {
  constructor(private client: Keyoku) {}

  /**
   * List all entities.
   */
  async list(options?: EntityListOptions): Promise<Entity[]> {
    const response = await this.client.request<{ entities: Entity[] }>(
      "GET",
      "/v1/entities",
      {
        params: {
          limit: options?.limit || 50,
          offset: options?.offset || 0,
          type: options?.type,
        },
      }
    );
    return (response.entities || []).map((e) => ({
      ...e,
      createdAt: new Date(e.createdAt),
      updatedAt: e.updatedAt ? new Date(e.updatedAt) : undefined,
    }));
  }

  /**
   * Search entities by name.
   */
  async search(query: string, options?: EntitySearchOptions): Promise<Entity[]> {
    const response = await this.client.request<{ entities: Entity[] }>(
      "GET",
      "/v1/entities/search",
      {
        params: {
          query,
          limit: options?.limit || 10,
          type: options?.type,
        },
      }
    );
    return (response.entities || []).map((e) => ({
      ...e,
      createdAt: new Date(e.createdAt),
      updatedAt: e.updatedAt ? new Date(e.updatedAt) : undefined,
    }));
  }

  /**
   * Get a specific entity by ID.
   */
  async get(entityId: string): Promise<Entity> {
    const response = await this.client.request<Entity>(
      "GET",
      `/v1/entities/${entityId}`
    );
    return {
      ...response,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
    };
  }

  /**
   * Get relationships for an entity.
   */
  async relationships(
    entityId: string,
    options?: RelationshipOptions
  ): Promise<Relationship[]> {
    const response = await this.client.request<{ relationships: Relationship[] }>(
      "GET",
      `/v1/entities/${entityId}/relationships`,
      {
        params: {
          direction: options?.direction || "both",
          type: options?.type,
        },
      }
    );
    return (response.relationships || []).map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
    }));
  }
}
