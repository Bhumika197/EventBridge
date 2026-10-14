import { ValidationHandler, ValidationContext } from './ValidationHandler';
import {
  AuthCheckHandler,
  EventStatusHandler,
  VisibilityCheckHandler,
  CollegeEligibilityHandler,
  DeadlineCheckHandler,
  DuplicateRegistrationHandler
} from './ConcreteHandlers';
import { RegistrationValidationResult } from '../../types';

export class RegistrationValidationChain {
  private head: ValidationHandler;

  constructor() {
    // Construct the sequential Chain of Responsibility:
    // 1. AuthCheckHandler (Authentication & Student Role)
    // 2. EventStatusHandler (Published status)
    // 3. VisibilityCheckHandler (Intra vs Inter college)
    // 4. CollegeEligibilityHandler (Institution affiliation)
    // 5. DeadlineCheckHandler (Registration window & deadline)
    // 6. DuplicateRegistrationHandler (Already registered check)

    const authCheck = new AuthCheckHandler();
    const eventStatus = new EventStatusHandler();
    const visibility = new VisibilityCheckHandler();
    const collegeEligibility = new CollegeEligibilityHandler();
    const deadline = new DeadlineCheckHandler();
    const duplicate = new DuplicateRegistrationHandler();

    authCheck
      .setNext(eventStatus)
      .setNext(visibility)
      .setNext(collegeEligibility)
      .setNext(deadline)
      .setNext(duplicate);

    this.head = authCheck;
  }

  public async validate(context: ValidationContext): Promise<RegistrationValidationResult> {
    return this.head.handle(context);
  }
}
