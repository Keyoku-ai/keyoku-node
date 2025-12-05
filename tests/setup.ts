/**
 * Test setup for Keyoku SDK tests.
 */

import { vi } from "vitest";

// Mock fetch globally
export const mockFetch = vi.fn();
global.fetch = mockFetch;

/**
 * Create a mock response.
 */
export function mockResponse(data: unknown, options?: { ok?: boolean; status?: number }) {
  return {
    ok: options?.ok ?? true,
    status: options?.status ?? 200,
    statusText: options?.status === 401 ? "Unauthorized" : "OK",
    text: async () => JSON.stringify(data),
    json: async () => data,
  };
}

/**
 * Create an error response.
 */
export function mockErrorResponse(
  status: number,
  message: string,
  code?: string
) {
  return {
    ok: false,
    status,
    statusText: getStatusText(status),
    text: async () => JSON.stringify({ error: { message, code } }),
    json: async () => ({ error: { message, code } }),
  };
}

function getStatusText(status: number): string {
  switch (status) {
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 404:
      return "Not Found";
    case 429:
      return "Too Many Requests";
    case 500:
      return "Internal Server Error";
    default:
      return "Unknown";
  }
}

/**
 * Sample data for tests.
 */
export const sampleData = {
  memory: {
    id: "mem_123",
    content: "User likes pizza",
    type: "preference",
    agentId: "default",
    importance: 0.8,
    createdAt: "2024-01-01T00:00:00Z",
  },
  memoryWithScore: {
    id: "mem_123",
    content: "User likes pizza",
    type: "preference",
    agentId: "default",
    importance: 0.8,
    score: 0.95,
    createdAt: "2024-01-01T00:00:00Z",
  },
  entity: {
    id: "ent_123",
    name: "John Doe",
    type: "person",
    properties: { age: 30 },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  relationship: {
    id: "rel_123",
    sourceId: "ent_1",
    targetId: "ent_2",
    type: "knows",
    properties: { since: "2020" },
    createdAt: "2024-01-01T00:00:00Z",
  },
  schema: {
    id: "sch_123",
    name: "UserPreference",
    description: "Schema for user preferences",
    schema: { type: "object", properties: { category: { type: "string" } } },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
  },
  job: {
    id: "job_123",
    status: "completed",
    result: { memoriesCreated: 1 },
    createdAt: "2024-01-01T00:00:00Z",
    completedAt: "2024-01-01T00:00:01Z",
  },
};
