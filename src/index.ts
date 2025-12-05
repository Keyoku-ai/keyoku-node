/**
 * Keyoku TypeScript SDK
 *
 * @example
 * ```typescript
 * import { Keyoku } from '@keyoku/sdk';
 *
 * const keyoku = new Keyoku({ apiKey: 'your-api-key' });
 *
 * await keyoku.remember('User prefers dark mode');
 * const memories = await keyoku.search('preferences');
 * ```
 */

export { Keyoku, JobHandle } from "./client";
export * from "./types";
export * from "./errors";
