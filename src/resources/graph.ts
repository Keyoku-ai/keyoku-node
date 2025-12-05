/**
 * Graph Resource
 */

import type { Keyoku } from "../client";
import type { Entity, Relationship, PathResult, FindPathOptions } from "../types";

export class GraphResource {
  constructor(private client: Keyoku) {}

  /**
   * Find the shortest path between two entities.
   */
  async findPath(
    fromEntity: string,
    toEntity: string,
    options?: FindPathOptions
  ): Promise<PathResult | null> {
    const response = await this.client.request<{
      path: boolean;
      entities: Entity[];
      relationships: Relationship[];
    }>("GET", "/v1/graph/path", {
      params: {
        from: fromEntity,
        to: toEntity,
        max_depth: options?.maxDepth || 5,
        relationship_types: options?.relationshipTypes?.join(","),
      },
    });

    if (!response.path) {
      return null;
    }

    return {
      entities: (response.entities || []).map((e) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      })),
      relationships: (response.relationships || []).map((r) => ({
        ...r,
        createdAt: new Date(r.createdAt),
      })),
      length: response.relationships?.length || 0,
    };
  }
}
