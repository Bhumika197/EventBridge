import { runEventTests } from "./event.test.js";
import { runLifecycleTests } from "./lifecycle.test.js";
import { runAuthorizationTests } from "./authorization.test.js";
import { runRegistrationTests } from "./registration.test.js";
import { runWaitlistTests } from "./waitlist.test.js";
import { runNewPatternsTests } from "./newPatterns.test.js";
import { runCustomDbTests } from "./customDb.test.js";
import { setupTestDb } from "./testHelper.js";
import { seedDatabase } from "../src/seed/seedData.js";
async function main() {
  console.log("====================================================");
  console.log("\u{1F680} EVENTBRIDGE AUTOMATED TEST RUNNER");
  console.log("====================================================\n");
  try {
    await setupTestDb();
    await seedDatabase();
    await runEventTests();
    await runLifecycleTests();
    await runAuthorizationTests();
    await runRegistrationTests();
    await runWaitlistTests();
    await runNewPatternsTests();
    await runCustomDbTests();
    console.log("====================================================");
    console.log("\u{1F389} ALL 7 TEST SUITES PASSED SUCCESSFULLY (100% GREEN)");
    console.log("====================================================");
    process.exit(0);
  } catch (error) {
    console.error("\n\u274C TEST SUITE FAILURE:", error);
    process.exit(1);
  }
}
main();
