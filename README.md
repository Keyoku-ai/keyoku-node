# Keyoku TypeScript SDK

The official TypeScript/Node.js SDK for [Keyoku](https://keyoku.dev) - AI Memory Infrastructure.

## Installation

```bash
npm install @keyoku/sdk
```

## Quick Start

```typescript
import { Keyoku } from "@keyoku/sdk";

const keyoku = new Keyoku({ apiKey: "your-api-key" });

// Store a memory
const job = await keyoku.remember("User prefers dark mode and uses VS Code");
await job.wait();

// Search memories
const memories = await keyoku.search("What editor does the user prefer?");
for (const memory of memories) {
  console.log(`${memory.content} (score: ${memory.score.toFixed(2)})`);
}
```

## Framework Integrations

### Vercel AI SDK

```typescript
import { createKeyokuMemory } from "@keyoku/sdk/integrations/vercel-ai";

const memory = createKeyokuMemory({ apiKey: "your-api-key" });

// Get context for your prompt
const context = await memory.getContext("user preferences");

// Save conversation turns
await memory.saveConversation(userMessage, assistantResponse);
```

### LangChain.js

```typescript
import { KeyokuMemory } from "@keyoku/sdk/integrations/langchain";

const memory = new KeyokuMemory({
  apiKey: "your-api-key",
  sessionId: "conversation-123",
});
```

## API Reference

### Memories

```typescript
// Store a memory
keyoku.remember(content, { sessionId?, agentId? });

// Search memories
keyoku.search(query, { limit?, mode?, agentId? });

// List memories
keyoku.memories.list({ limit?, offset?, agentId? });

// Get a memory
keyoku.memories.get(memoryId);

// Delete a memory
keyoku.memories.delete(memoryId);

// Delete all memories
keyoku.memories.deleteAll();

// Batch operations
keyoku.memories.batchCreate(contents);
keyoku.memories.batchDelete(memoryIds);
```

### Knowledge Graph

```typescript
// Entities
keyoku.entities.list({ limit?, offset?, type? });
keyoku.entities.search(query, { limit?, type? });
keyoku.entities.get(entityId);
keyoku.entities.relationships(entityId, { direction?, type? });

// Relationships
keyoku.relationships.list({ limit?, offset?, type? });
keyoku.relationships.get(relationshipId);

// Graph traversal
keyoku.graph.findPath(fromEntity, toEntity, { maxDepth?, relationshipTypes? });
```

### Schemas

```typescript
keyoku.schemas.list();
keyoku.schemas.get(schemaId);
keyoku.schemas.create(name, schema, description?);
keyoku.schemas.update(schemaId, { name?, schema?, description? });
keyoku.schemas.delete(schemaId);
```

## Configuration

```typescript
const keyoku = new Keyoku({
  apiKey: "your-api-key",
  baseUrl: "https://api.keyoku.dev", // Custom API URL
  timeout: 30000, // Request timeout in ms
  entityId: "user-123", // Multi-tenant isolation
});
```

## Error Handling

```typescript
import {
  KeyokuError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
} from "@keyoku/sdk";

try {
  await keyoku.remember("test");
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Invalid API key");
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  }
}
```

## License

MIT
