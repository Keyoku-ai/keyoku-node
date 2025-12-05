import { describe, it, expect, beforeEach } from "vitest";
import { Keyoku } from "../../src/client";
import { mockFetch, mockResponse, sampleData } from "../setup";

describe("JobsResource", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("get", () => {
    it("should get a job by ID", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.job));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const job = await keyoku.jobs.get("job_123");

      expect(job.id).toBe("job_123");
      expect(job.status).toBe("completed");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/jobs/job_123"),
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should include job result", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.job));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const job = await keyoku.jobs.get("job_123");

      expect(job.result).toEqual({ memoriesCreated: 1 });
    });

    it("should convert createdAt to Date", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.job));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const job = await keyoku.jobs.get("job_123");

      expect(job.createdAt).toBeInstanceOf(Date);
    });

    it("should convert completedAt to Date when present", async () => {
      mockFetch.mockResolvedValueOnce(mockResponse(sampleData.job));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const job = await keyoku.jobs.get("job_123");

      expect(job.completedAt).toBeInstanceOf(Date);
    });

    it("should handle pending job without completedAt", async () => {
      const pendingJob = {
        id: "job_456",
        status: "pending",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockFetch.mockResolvedValueOnce(mockResponse(pendingJob));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const job = await keyoku.jobs.get("job_456");

      expect(job.status).toBe("pending");
      expect(job.completedAt).toBeUndefined();
    });

    it("should handle processing job", async () => {
      const processingJob = {
        id: "job_789",
        status: "processing",
        createdAt: "2024-01-01T00:00:00Z",
      };
      mockFetch.mockResolvedValueOnce(mockResponse(processingJob));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const job = await keyoku.jobs.get("job_789");

      expect(job.status).toBe("processing");
    });

    it("should handle failed job with error", async () => {
      const failedJob = {
        id: "job_fail",
        status: "failed",
        error: "Processing failed: Invalid content",
        createdAt: "2024-01-01T00:00:00Z",
        completedAt: "2024-01-01T00:00:05Z",
      };
      mockFetch.mockResolvedValueOnce(mockResponse(failedJob));

      const keyoku = new Keyoku({ apiKey: "test-key" });
      const job = await keyoku.jobs.get("job_fail");

      expect(job.status).toBe("failed");
      expect(job.error).toBe("Processing failed: Invalid content");
    });
  });
});
