/**
 * Data Resource (GDPR Export)
 */

import type { Keyoku } from "../client";
import type { ExportResponse } from "../types";

export class DataResource {
  constructor(private client: Keyoku) {}

  /**
   * Start a GDPR data export job.
   * Returns a job_id that can be polled for completion.
   */
  async export(): Promise<ExportResponse> {
    return this.client.request<ExportResponse>("GET", "/v1/data/export");
  }

  /**
   * Download an export file after the export job completes.
   *
   * @param jobId - The job ID from the export() call
   * @returns The export file as a Response (can be streamed or converted to blob)
   */
  async download(jobId: string): Promise<Response> {
    const url = `${(this.client as any).baseUrl}/v1/data/export/${jobId}/download`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${(this.client as any).apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response;
  }
}
