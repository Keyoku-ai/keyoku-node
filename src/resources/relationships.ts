/**
 * Relationships Resource
 */

import type { Keyoku } from "../client";
import type { Relationship, EntityListOptions } from "../types";

export class RelationshipsResource {
  constructor(private client: Keyoku) {}

  /**
   * List all relationships.
   */
  async list(options?: EntityListOptions): Promise<Relationship[]> {
    const response = await this.client.request<{ relationships: Relationship[] }>(
      "GET",
      "/v1/relationships",
      {
        params: {
          limit: options?.limit || 50,
          offset: options?.offset || 0,
          type: options?.type,
        },
      }
    );
    return (response.relationships || []).map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
    }));
  }

  /**
   * Get a specific relationship by ID.
   */
  async get(relationshipId: string): Promise<Relationship> {
    const response = await this.client.request<Relationship>(
      "GET",
      `/v1/relationships/${relationshipId}`
    );
    return {
      ...response,
      createdAt: new Date(response.createdAt),
    };
  }
}
