import { DatabaseManager } from "../src/db/DatabaseManager.js";
export async function setupTestDb() {
  const dbManager = DatabaseManager.getInstance();
  await dbManager.initialize();
  return dbManager;
}
export function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}
export function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Assertion Failed: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}. ${message || ""}`);
  }
}
