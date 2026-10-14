import { TechnicalEventFactory, CulturalEventFactory, SportsEventFactory } from "../factory/EventFactory";
export class TechRegistrationPolicy {
  getPolicyName() {
    return "Technical Event Policy";
  }
  getRequirements() {
    return ["Laptop required", "GitHub profile optional", "Individual or Duo"];
  }
  validate(studentDepartment, studentYear) {
    return { valid: true };
  }
}
export class TechEligibilityPolicy {
  getPolicyName() {
    return "Technical Eligibility";
  }
  getRules() {
    return ["Basic knowledge of programming or engineering concepts required."];
  }
}
export class CulturalRegistrationPolicy {
  getPolicyName() {
    return "Cultural Event Policy";
  }
  getRequirements() {
    return ["Stage prop declaration mandatory", "Performance track submission"];
  }
  validate(studentDepartment, studentYear) {
    return { valid: true };
  }
}
export class CulturalEligibilityPolicy {
  getPolicyName() {
    return "Cultural Eligibility";
  }
  getRules() {
    return ["Enrolled student status verified by student ID card."];
  }
}
export class SportsRegistrationPolicy {
  getPolicyName() {
    return "Sports Event Policy";
  }
  getRequirements() {
    return ["Medical fitness declaration", "Proper sports equipment & shoes required"];
  }
  validate(studentDepartment, studentYear) {
    return { valid: true };
  }
}
export class SportsEligibilityPolicy {
  getPolicyName() {
    return "Sports Eligibility";
  }
  getRules() {
    return ["Must pass pre-match health screening."];
  }
}
export class TechnicalComponentFactory {
  eventFactory = new TechnicalEventFactory();
  createEvent(data) {
    return this.eventFactory.createEvent(data);
  }
  createRegistrationPolicy() {
    return new TechRegistrationPolicy();
  }
  createEligibilityPolicy() {
    return new TechEligibilityPolicy();
  }
}
export class CulturalComponentFactory {
  eventFactory = new CulturalEventFactory();
  createEvent(data) {
    return this.eventFactory.createEvent(data);
  }
  createRegistrationPolicy() {
    return new CulturalRegistrationPolicy();
  }
  createEligibilityPolicy() {
    return new CulturalEligibilityPolicy();
  }
}
export class SportsComponentFactory {
  eventFactory = new SportsEventFactory();
  createEvent(data) {
    return this.eventFactory.createEvent(data);
  }
  createRegistrationPolicy() {
    return new SportsRegistrationPolicy();
  }
  createEligibilityPolicy() {
    return new SportsEligibilityPolicy();
  }
}
export class AbstractFactoryProvider {
  static getComponentFactory(category) {
    switch (category) {
      case "Cultural":
        return new CulturalComponentFactory();
      case "Sports":
        return new SportsComponentFactory();
      case "Technical":
      default:
        return new TechnicalComponentFactory();
    }
  }
}
