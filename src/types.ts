/**
 * Keyoku SDK Types
 */

export interface KeyokuConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  entityId?: string;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface Job {
  id: string;
  status: JobStatus;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Memory {
  id: string;
  content: string;
  type: string;
  agentId: string;
  importance: number;
  createdAt: Date;
}

export interface MemorySearchResult extends Memory {
  score: number;
}

export interface ListMemoriesResponse {
  memories: Memory[];
  total: number;
  hasMore: boolean;
}

export interface SearchResponse {
  memories: MemorySearchResult[];
  queryTimeMs: number;
}

export interface Entity {
  id: string;
  canonicalName: string;
  type: string;
  properties: Record<string, unknown>;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Relationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: string;
  properties: Record<string, unknown>;
  createdAt: Date;
}

export interface PathResult {
  entities: Entity[];
  relationships: Relationship[];
  length: number;
}

export interface Schema {
  id: string;
  name: string;
  description?: string;
  schema: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stats {
  totalMemories: number;
  byType: Record<string, number>;
}

export interface RememberOptions {
  sessionId?: string;
  agentId?: string;
}

export interface SearchOptions {
  limit?: number;
  mode?: "semantic" | "keyword" | "hybrid";
  agentId?: string;
}

export interface ListOptions {
  limit?: number;
  offset?: number;
  agentId?: string;
}

export interface EntityListOptions {
  limit?: number;
  offset?: number;
  type?: string;
}

export interface EntitySearchOptions {
  limit?: number;
  type?: string;
}

export interface RelationshipOptions {
  direction?: "incoming" | "outgoing" | "both";
  type?: string;
}

export interface FindPathOptions {
  maxDepth?: number;
  relationshipTypes?: string[];
}

export interface KeyokuError extends Error {
  statusCode?: number;
  code?: string;
}

// Cleanup types
export type CleanupStrategy = "stale" | "low_importance" | "oldest" | "never_accessed";

export interface CleanupSuggestion {
  strategy: CleanupStrategy;
  description: string;
  count: number;
}

export interface CleanupUsage {
  memories_stored: number;
  memories_limit: number;
  percentage: number;
}

export interface CleanupSuggestionsResponse {
  suggestions: CleanupSuggestion[];
  usage: CleanupUsage;
}

export interface CleanupRequest {
  strategy: CleanupStrategy;
  limit?: number;
  dry_run?: boolean;
}

export interface CleanupResponse {
  deleted_count: number;
  deleted_ids?: string[];
}

// GDPR Export types
export interface ExportResponse {
  job_id: string;
  status: string;
}

// Audit types
export interface AuditLog {
  id: string;
  operation: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface AuditLogsResponse {
  audit_logs: AuditLog[];
  total: number;
  has_more: boolean;
}

export interface AuditLogsQuery {
  operation?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}
