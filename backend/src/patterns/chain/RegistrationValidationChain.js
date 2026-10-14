import {
  AuthCheckHandler,
  EventStatusHandler,
  VisibilityCheckHandler,
  CollegeEligibilityHandler,
  DeadlineCheckHandler,
  DuplicateRegistrationHandler
} from "./ConcreteHandlers.js";
export class RegistrationValidationChain {
  head;
  constructor() {
    const authCheck = new AuthCheckHandler();
    const eventStatus = new EventStatusHandler();
    const visibility = new VisibilityCheckHandler();
    const collegeEligibility = new CollegeEligibilityHandler();
    const deadline = new DeadlineCheckHandler();
    const duplicate = new DuplicateRegistrationHandler();
    authCheck.setNext(eventStatus).setNext(visibility).setNext(collegeEligibility).setNext(deadline).setNext(duplicate);
    this.head = authCheck;
  }
  async validate(context) {
    return this.head.handle(context);
  }
}
