/**
 * LangChain.js integration for Keyoku
 *
 * @example
 * ```typescript
 * import { KeyokuMemory } from '@keyoku/sdk/integrations/langchain';
 *
 * const memory = new KeyokuMemory({ apiKey: 'your-api-key' });
 * ```
 */

import { Keyoku } from "../client";
import type { KeyokuConfig } from "../types";

// Note: These types are simplified. In production, you'd import from @langchain/core
interface BaseMessage {
  content: string;
  type: string;
}

interface InputValues {
  [key: string]: unknown;
}

interface OutputValues {
  [key: string]: unknown;
}

export interface KeyokuMemoryConfig extends KeyokuConfig {
  sessionId?: string;
  agentId?: string;
  memoryKey?: string;
  returnMessages?: boolean;
}

/**
 * LangChain-compatible chat message history backed by Keyoku.
 */
export class KeyokuChatMessageHistory {
  private client: Keyoku;
  private sessionId: string;
  private agentId?: string;
  private messages: BaseMessage[] = [];

  constructor(config: KeyokuConfig & { sessionId: string; agentId?: string }) {
    this.client = new Keyoku(config);
    this.sessionId = config.sessionId;
    this.agentId = config.agentId;
  }

  async getMessages(): Promise<BaseMessage[]> {
    return this.messages;
  }

  async addMessage(message: BaseMessage): Promise<void> {
    this.messages.push(message);
    const content = `[${message.type}]: ${message.content}`;
    await this.client.remember(content, {
      sessionId: this.sessionId,
      agentId: this.agentId,
    });
  }

  async addUserMessage(content: string): Promise<void> {
    await this.addMessage({ type: "human", content });
  }

  async addAIMessage(content: string): Promise<void> {
    await this.addMessage({ type: "ai", content });
  }

  async clear(): Promise<void> {
    this.messages = [];
  }
}

/**
 * LangChain-compatible memory backed by Keyoku.
 */
export class KeyokuMemory {
  private client: Keyoku;
  private sessionId?: string;
  private agentId?: string;
  private memoryKey: string;
  private returnMessages: boolean;
  private buffer: string[] = [];

  constructor(config: KeyokuMemoryConfig) {
    this.client = new Keyoku(config);
    this.sessionId = config.sessionId;
    this.agentId = config.agentId;
    this.memoryKey = config.memoryKey || "history";
    this.returnMessages = config.returnMessages || false;
  }

  get memoryVariables(): string[] {
    return [this.memoryKey];
  }

  async loadMemoryVariables(
    values: InputValues
  ): Promise<Record<string, unknown>> {
    // Search for relevant memories based on input
    const query = Object.values(values).join(" ");
    if (query) {
      const memories = await this.client.search(query, {
        limit: 5,
        agentId: this.agentId,
      });
      const context = memories.map((m) => m.content).join("\n");
      return { [this.memoryKey]: context };
    }
    return { [this.memoryKey]: this.buffer.join("\n") };
  }

  async saveContext(
    inputValues: InputValues,
    outputValues: OutputValues
  ): Promise<void> {
    const input = JSON.stringify(inputValues);
    const output = JSON.stringify(outputValues);
    const content = `Input: ${input}\nOutput: ${output}`;

    this.buffer.push(content);

    await this.client.remember(content, {
      sessionId: this.sessionId,
      agentId: this.agentId,
    });
  }

  async clear(): Promise<void> {
    this.buffer = [];
  }
}
