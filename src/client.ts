/**
 * Keyoku TypeScript Client
 */

import {
  KeyokuConfig,
  Job,
  JobStatus,
  MemorySearchResult,
  Stats,
  RememberOptions,
  SearchOptions,
} from "./types";
import {
  KeyokuError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from "./errors";
import { MemoriesResource } from "./resources/memories";
import { EntitiesResource } from "./resources/entities";
import { RelationshipsResource } from "./resources/relationships";
import { GraphResource } from "./resources/graph";
import { SchemasResource } from "./resources/schemas";
import { JobsResource } from "./resources/jobs";

const DEFAULT_BASE_URL = "https://api.keyoku.dev";
const DEFAULT_TIMEOUT = 30000;

export class Keyoku {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private entityId?: string;

  // Resources
  public memories: MemoriesResource;
  public entities: EntitiesResource;
  public relationships: RelationshipsResource;
  public graph: GraphResource;
  public schemas: SchemasResource;
  public jobs: JobsResource;

  constructor(config: KeyokuConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
    this.entityId = config.entityId;

    // Initialize resources
    this.memories = new MemoriesResource(this);
    this.entities = new EntitiesResource(this);
    this.relationships = new RelationshipsResource(this);
    this.graph = new GraphResource(this);
    this.schemas = new SchemasResource(this);
    this.jobs = new JobsResource(this);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "keyoku-node/0.1.0",
    };
    if (this.entityId) {
      headers["X-Entity-ID"] = this.entityId;
    }
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (response.ok) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }

    let message = "Unknown error";
    try {
      const error = await response.json();
      message = error?.error?.message || message;
    } catch {
      message = response.statusText || message;
    }

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message);
      case 404:
        throw new NotFoundError(message);
      case 400:
      case 422:
        throw new ValidationError(message);
      case 429:
        const retryAfter = response.headers.get("Retry-After");
        throw new RateLimitError(
          message,
          retryAfter ? parseInt(retryAfter) : undefined
        );
      default:
        if (response.status >= 500) {
          throw new ServerError(message);
        }
        throw new KeyokuError(message, response.status);
    }
  }

  async request<T>(
    method: string,
    path: string,
    options?: { json?: Record<string, unknown>; params?: Record<string, unknown> }
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;

    if (options?.params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(options.params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.getHeaders(),
        body: options?.json ? JSON.stringify(options.json) : undefined,
        signal: controller.signal,
      });
      return this.handleResponse<T>(response);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Store a memory asynchronously.
   */
  async remember(
    content: string,
    options?: RememberOptions
  ): Promise<JobHandle> {
    const response = await this.request<{ job_id: string; status: string }>(
      "POST",
      "/v1/memories",
      {
        json: {
          content,
          session_id: options?.sessionId,
          agent_id: options?.agentId,
        },
      }
    );
    return new JobHandle(this, response.job_id);
  }

  /**
   * Search memories.
   */
  async search(
    query: string,
    options?: SearchOptions
  ): Promise<MemorySearchResult[]> {
    const response = await this.request<{ memories: MemorySearchResult[] }>(
      "POST",
      "/v1/memories/search",
      {
        json: {
          query,
          limit: options?.limit || 10,
          mode: options?.mode || "hybrid",
          agent_id: options?.agentId,
        },
      }
    );
    return response.memories.map((m) => ({
      ...m,
      createdAt: new Date(m.createdAt),
    }));
  }

  /**
   * Get memory statistics.
   */
  async stats(): Promise<Stats> {
    return this.request<Stats>("GET", "/v1/stats");
  }
}

/**
 * Handle for an async job that can be polled or waited on.
 */
export class JobHandle {
  constructor(
    private client: Keyoku,
    public jobId: string
  ) {}

  /**
   * Get current job status.
   */
  async get(): Promise<Job> {
    const response = await this.client.request<Job>(
      "GET",
      `/v1/jobs/${this.jobId}`
    );
    return {
      ...response,
      createdAt: new Date(response.createdAt),
      completedAt: response.completedAt
        ? new Date(response.completedAt)
        : undefined,
    };
  }

  /**
   * Wait for job to complete.
   */
  async wait(options?: {
    pollInterval?: number;
    timeout?: number;
  }): Promise<Job> {
    const pollInterval = options?.pollInterval || 500;
    const timeout = options?.timeout;
    const start = Date.now();

    while (true) {
      const job = await this.get();

      if (job.status === "completed") {
        return job;
      }
      if (job.status === "failed") {
        throw new KeyokuError(job.error || "Job failed");
      }

      if (timeout && Date.now() - start > timeout) {
        throw new Error(`Job ${this.jobId} did not complete in ${timeout}ms`);
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }
}
