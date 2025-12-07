/**
 * Audit Resource
 */

import type { Keyoku } from "../client";
import type { AuditLogsResponse, AuditLogsQuery } from "../types";

export class AuditResource {
  constructor(private client: Keyoku) {}

  /**
   * List audit logs with optional filtering.
   *
   * @param query.operation - Filter by operation type (e.g., "memory.create")
   * @param query.resource_type - Filter by resource type (e.g., "memory")
   * @param query.start_date - Filter by start date (RFC3339 format)
   * @param query.end_date - Filter by end date (RFC3339 format)
   * @param query.limit - Number of logs to return (default: 50, max: 100)
   * @param query.offset - Pagination offset
   */
  async list(query?: AuditLogsQuery): Promise<AuditLogsResponse> {
    return this.client.request<AuditLogsResponse>("GET", "/v1/audit-logs", {
      params: {
        operation: query?.operation,
        resource_type: query?.resource_type,
        start_date: query?.start_date,
        end_date: query?.end_date,
        limit: query?.limit,
        offset: query?.offset,
      },
    });
  }
}
