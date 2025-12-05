/**
 * Jobs Resource
 */

import type { Keyoku } from "../client";
import type { Job } from "../types";

export class JobsResource {
  constructor(private client: Keyoku) {}

  /**
   * Get a job by ID.
   */
  async get(jobId: string): Promise<Job> {
    const response = await this.client.request<Job>(
      "GET",
      `/v1/jobs/${jobId}`
    );
    return {
      ...response,
      createdAt: new Date(response.createdAt),
      completedAt: response.completedAt
        ? new Date(response.completedAt)
        : undefined,
    };
  }
}
