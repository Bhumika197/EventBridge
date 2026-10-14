import { DatabaseManager } from '../src/db/DatabaseManager';

export async function setupTestDb() {
  const dbManager = DatabaseManager.getInstance();
  await dbManager.initialize();
  return dbManager;
}

export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

export function assertEquals(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message || ''}`);
  }
}
