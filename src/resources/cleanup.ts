/**
 * Cleanup Resource
 */

import type { Keyoku } from "../client";
import type {
  CleanupSuggestionsResponse,
  CleanupRequest,
  CleanupResponse,
} from "../types";

export class CleanupResource {
  constructor(private client: Keyoku) {}

  /**
   * Get cleanup suggestions for memory management.
   * Returns strategies like stale, low_importance, oldest, never_accessed.
   */
  async suggestions(): Promise<CleanupSuggestionsResponse> {
    return this.client.request<CleanupSuggestionsResponse>(
      "GET",
      "/v1/memories/cleanup-suggestions"
    );
  }

  /**
   * Execute a cleanup strategy to delete memories.
   *
   * @param options.strategy - Cleanup strategy: stale, low_importance, oldest, never_accessed
   * @param options.limit - Maximum number of memories to delete (default: 100, max: 1000)
   * @param options.dry_run - If true, returns what would be deleted without deleting
   */
  async execute(options: CleanupRequest): Promise<CleanupResponse> {
    return this.client.request<CleanupResponse>("POST", "/v1/memories/cleanup", {
      json: {
        strategy: options.strategy,
        limit: options.limit,
        dry_run: options.dry_run,
      },
    });
  }
}
