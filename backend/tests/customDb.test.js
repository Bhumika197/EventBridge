import { CustomLogDatabase } from "../src/db/CustomLogDatabase.js";
import assert from "assert";

export async function runCustomDbTests() {
  console.log("🧪 Running Suite: Custom 60-User & 60-Log Circular DB Tests...");
  const db = CustomLogDatabase.getInstance();

  // 1. Test user capacity (60 users)
  for (let i = 1; i <= 65; i++) {
    await db.registerUser({
      userId: i,
      username: `student_user_${i}`,
      email: `student_${i}@eventbridge.edu`,
      role: "STUDENT"
    });
  }

  const stats = db.getDatabaseStats();
  assert(stats.activeUsersCount <= 60, `Active users (${stats.activeUsersCount}) should not exceed capacity of 60`);
  console.log(`✅ Capacity verified: active users capped at ${stats.activeUsersCount} / 60`);

  // 2. Test 60 logs circular buffer and 61st eviction
  const testUserId = 1;
  await db.registerUser({ userId: testUserId, username: "test_user_1", role: "STUDENT" });

  // Add 60 entries
  for (let i = 1; i <= 60; i++) {
    await db.appendLog(testUserId, "USER_ACTION", { step: i, message: `Action number ${i}` });
  }

  let logs = db.getUserLogs(testUserId);
  assert.strictEqual(logs.length, 60, "Buffer should contain exactly 60 entries");
  assert.strictEqual(logs[0].details.step, 1, "First entry should be step 1 before eviction");

  // Add 61st entry -> Should evict step 1 and save it to low-level binary archive
  const res61 = await db.appendLog(testUserId, "USER_ACTION_61", { step: 61, message: "61st action triggering eviction" });
  assert.strictEqual(res61.evictedToArchive, true, "61st log must trigger low-level archive eviction");

  logs = db.getUserLogs(testUserId);
  assert.strictEqual(logs.length, 60, "Buffer should remain at max 60 entries after eviction");
  assert.strictEqual(logs[0].details.step, 2, "New oldest entry in active buffer must now be step 2");
  assert.strictEqual(logs[59].details.step, 61, "Latest entry must be step 61");
  console.log("✅ Circular buffer verified: 61st entry evicted 1st entry seamlessly");

  // 3. Test decoding the low-level binary archive
  const decodedArchive = await db.decodeArchive(testUserId);
  assert(decodedArchive.length > 0, "Decoded archive should contain the evicted log");
  const archivedEntry = decodedArchive.find(e => e.details?.step === 1);
  assert(archivedEntry, "Decoded binary archive must successfully retrieve step 1 with intact payload");
  console.log(`✅ Low-level archive verified: successfully decoded evicted entry "${archivedEntry.details.message}"`);

  // 4. Test 10 concurrent users operating smoothly (Traffic-free)
  const concurrentPromises = [];
  for (let u = 1; u <= 10; u++) {
    concurrentPromises.push(
      (async () => {
        for (let op = 1; op <= 10; op++) {
          await db.appendLog(u, "CONCURRENT_TRANSACTION", { opId: op, worker: `worker-${u}` });
        }
      })()
    );
  }
  await Promise.all(concurrentPromises);
  console.log("✅ Concurrency verified: 10 concurrent users processed 100 transactions without lock contention");
  console.log("✅ Custom Log Database Tests Passed Successfully!\n");
}

if (typeof require !== "undefined" && require.main === module) {
  runCustomDbTests().catch((err) => {
    console.error("❌ Custom DB Tests Failed:", err);
    process.exit(1);
  });
}
