import { ValidationHandler, ValidationContext } from './ValidationHandler';
import {
  AuthCheckHandler,
  EventStatusHandler,
  VisibilityCheckHandler,
  CollegeEligibilityHandler,
  DeadlineCheckHandler,
  CapacityCheckHandler,
  DuplicateRegistrationHandler
} from './ConcreteHandlers';
import { RegistrationValidationResult } from '../../types';

export class RegistrationValidationChain {
  private head: ValidationHandler;

  constructor() {
    // Construct the explicit Chain of Responsibility:
    // 1. Auth Check
    // 2. Event Status Check
    // 3. Event Visibility Check
    // 4. College Eligibility Check
    // 5. Registration Deadline Check
    // 6. Capacity Check
    // 7. Duplicate Registration Check

    const authCheck = new AuthCheckHandler();
    const eventStatus = new EventStatusHandler();
    const visibility = new VisibilityCheckHandler();
    const collegeEligibility = new CollegeEligibilityHandler();
    const deadline = new DeadlineCheckHandler();
    const capacity = new CapacityCheckHandler();
    const duplicate = new DuplicateRegistrationHandler();

    authCheck
      .setNext(eventStatus)
      .setNext(visibility)
      .setNext(collegeEligibility)
      .setNext(deadline)
      .setNext(capacity)
      .setNext(duplicate);

    this.head = authCheck;
  }

  public async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    return this.head.handle(context);
  }
}
