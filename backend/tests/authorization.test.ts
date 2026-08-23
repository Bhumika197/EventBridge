import { setupTestDb, assert, assertEquals } from './testHelper';
import { EventService } from '../src/services/EventService';
import { UserRepository } from '../src/repositories/UserRepository';

export async function runAuthorizationTests() {
  console.log('🧪 Running Suite: Proxy Pattern & College Isolation Authorization Tests...');
  await setupTestDb();

  const userRepo = new UserRepository();
  const eventService = new EventService();

  const studentRBU = (await userRepo.findByUsername('bhumika_rbu'))!; // College: RBU
  const studentRCOEM = (await userRepo.findByUsername('aarav_rcoem'))!; // College: RCOEM
  const admin = (await userRepo.findByUsername('admin'))!;
  const orgRBU = (await userRepo.findByUsername('org_rbu'))!;

  // 1. Create a strictly INTRA_COLLEGE event for RBU
  const intraEvent = await eventService.createEvent({
    title: 'RBU Closed Campus Coding Challenge',
    description: 'Restricted strictly to RBU enrolled students.',
    category: 'Technical',
    eventType: 'INTRA_COLLEGE',
    collegeId: studentRBU.collegeId,
    organizerId: orgRBU.userId,
    organizerName: orgRBU.name,
    date: '2026-11-25',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    venue: 'RBU CS Lab 3',
    registrationDeadline: '2026-11-23',
    capacity: 30,
    status: 'PUBLISHED'
  }, orgRBU);

  // 2. Member student of RBU should have full access
  const memberAccess = await eventService.getEventByIdForUser(intraEvent.eventId, studentRBU);
  assertEquals(memberAccess.restricted, false, 'RBU student should have unrestricted access to RBU intra event.');
  assert(!!memberAccess.event, 'Member access should return event metadata.');

  // 3. Student of RCOEM (different college) should be blocked by EventAccessProxy
  const nonMemberAccess = await eventService.getEventByIdForUser(intraEvent.eventId, studentRCOEM);
  assertEquals(nonMemberAccess.restricted, true, 'RCOEM student must be blocked from RBU intra-college event.');
  assert(nonMemberAccess.reason!.includes('Proxy Access Denied') || nonMemberAccess.reason!.includes('INTRA_COLLEGE'), 'Denial reason must cite intra-college restriction.');

  // 4. Unauthenticated guest should also be blocked
  const guestAccess = await eventService.getEventByIdForUser(intraEvent.eventId, undefined);
  assertEquals(guestAccess.restricted, true, 'Unauthenticated guest must be blocked from INTRA_COLLEGE event.');

  // 5. Platform Admin should have audit access
  const adminAccess = await eventService.getEventByIdForUser(intraEvent.eventId, admin);
  assertEquals(adminAccess.restricted, false, 'Platform Admin must have full governance access.');

  console.log('✅ Proxy Pattern & College Isolation Authorization Tests Passed!\n');
}

if (require.main === module) {
  runAuthorizationTests().catch(err => {
    console.error('❌ Authorization Tests Failed:', err);
    process.exit(1);
  });
}
