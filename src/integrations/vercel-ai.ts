/**
 * Vercel AI SDK integration for Keyoku
 *
 * @example
 * ```typescript
 * import { createKeyokuMemory } from '@keyoku/sdk/integrations/vercel-ai';
 *
 * const memory = createKeyokuMemory({ apiKey: 'your-api-key' });
 * ```
 */

import { Keyoku } from "../client";
import type { KeyokuConfig, MemorySearchResult } from "../types";

export interface KeyokuVercelConfig extends KeyokuConfig {
  sessionId?: string;
  agentId?: string;
}

export interface MemoryContext {
  memories: MemorySearchResult[];
  formatted: string;
}

/**
 * Create a Keyoku memory helper for Vercel AI SDK.
 */
export function createKeyokuMemory(config: KeyokuVercelConfig) {
  const client = new Keyoku(config);
  const sessionId = config.sessionId;
  const agentId = config.agentId;

  return {
    /**
     * Store a memory.
     */
    async remember(content: string): Promise<void> {
      const job = await client.remember(content, { sessionId, agentId });
      await job.wait();
    },

    /**
     * Search for relevant memories.
     */
    async search(query: string, limit = 5): Promise<MemoryContext> {
      const memories = await client.search(query, { limit, agentId });
      return {
        memories,
        formatted: memories.map((m) => m.content).join("\n\n"),
      };
    },

    /**
     * Get context for a prompt - searches memories and formats them.
     */
    async getContext(query: string, limit = 5): Promise<string> {
      const { formatted } = await this.search(query, limit);
      if (!formatted) return "";
      return `Relevant context from memory:\n${formatted}\n\n`;
    },

    /**
     * Save a conversation turn to memory.
     */
    async saveConversation(
      userMessage: string,
      assistantMessage: string
    ): Promise<void> {
      const content = `User: ${userMessage}\nAssistant: ${assistantMessage}`;
      await this.remember(content);
    },

    /**
     * Direct access to the Keyoku client.
     */
    client,
  };
}

export type KeyokuMemoryHelper = ReturnType<typeof createKeyokuMemory>;
