/**
 * Memories Resource
 */

import type { Keyoku } from "../client";
import type { Memory, ListMemoriesResponse, ListOptions } from "../types";

export class MemoriesResource {
  constructor(private client: Keyoku) {}

  /**
   * List all memories.
   */
  async list(options?: ListOptions): Promise<ListMemoriesResponse> {
    const response = await this.client.request<ListMemoriesResponse>(
      "GET",
      "/v1/memories",
      {
        params: {
          limit: options?.limit || 50,
          offset: options?.offset || 0,
          agent_id: options?.agentId,
        },
      }
    );
    return {
      ...response,
      memories: response.memories.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
      })),
    };
  }

  /**
   * Get a specific memory by ID.
   */
  async get(memoryId: string): Promise<Memory> {
    const response = await this.client.request<Memory>(
      "GET",
      `/v1/memories/${memoryId}`
    );
    return {
      ...response,
      createdAt: new Date(response.createdAt),
    };
  }

  /**
   * Delete a specific memory.
   */
  async delete(memoryId: string): Promise<void> {
    await this.client.request("DELETE", `/v1/memories/${memoryId}`);
  }

  /**
   * Delete all memories.
   */
  async deleteAll(): Promise<void> {
    await this.client.request("DELETE", "/v1/memories", {
      headers: { "X-Confirm-Delete": "true" },
    });
  }

  /**
   * Create multiple memories in batch.
   */
  async batchCreate(
    contents: string[],
    options?: { sessionId?: string; agentId?: string }
  ): Promise<{ jobId: string }> {
    return this.client.request("POST", "/v1/memories/batch", {
      json: {
        memories: contents.map((content) => ({ content })),
        session_id: options?.sessionId,
        agent_id: options?.agentId,
      },
    });
  }

  /**
   * Delete multiple memories in batch.
   */
  async batchDelete(memoryIds: string[]): Promise<void> {
    await this.client.request("DELETE", "/v1/memories/batch", {
      json: { ids: memoryIds },
    });
  }
}
