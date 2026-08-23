import { runEventTests } from './event.test';
import { runLifecycleTests } from './lifecycle.test';
import { runAuthorizationTests } from './authorization.test';
import { runRegistrationTests } from './registration.test';
import { runWaitlistTests } from './waitlist.test';
import { setupTestDb } from './testHelper';
import { seedDatabase } from '../src/seed/seedData';

async function main() {
  console.log('====================================================');
  console.log('🚀 EVENTBRIDGE AUTOMATED TEST RUNNER');
  console.log('====================================================\n');

  try {
    await setupTestDb();
    await seedDatabase();

    await runEventTests();
    await runLifecycleTests();
    await runAuthorizationTests();
    await runRegistrationTests();
    await runWaitlistTests();

    console.log('====================================================');
    console.log('🎉 ALL 5 TEST SUITES PASSED SUCCESSFULLY (100% GREEN)');
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILURE:', error);
    process.exit(1);
  }
}

main();
