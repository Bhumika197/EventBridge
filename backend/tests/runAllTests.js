import { runEventTests } from "./event.test";
import { runLifecycleTests } from "./lifecycle.test";
import { runAuthorizationTests } from "./authorization.test";
import { runRegistrationTests } from "./registration.test";
import { runWaitlistTests } from "./waitlist.test";
import { runNewPatternsTests } from "./newPatterns.test";
import { setupTestDb } from "./testHelper";
import { seedDatabase } from "../src/seed/seedData";
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
    console.log("====================================================");
    console.log("\u{1F389} ALL 6 TEST SUITES PASSED SUCCESSFULLY (100% GREEN)");
    console.log("====================================================");
    process.exit(0);
  } catch (error) {
    console.error("\n\u274C TEST SUITE FAILURE:", error);
    process.exit(1);
  }
}
main();
