import { EventCreationData, EventFactory, TechnicalEventFactory, CulturalEventFactory, SportsEventFactory } from '../factory/EventFactory';
import { Event } from '../../types';

/**
 * ABSTRACT FACTORY DESIGN PATTERN
 * 
 * Problem: Different event categories require family-specific related components:
 * an Event instance, a Registration Policy (e.g. equipment/team requirements), 
 * and an Eligibility Policy. Creating these components independently risks mismatching rules across categories.
 * 
 * Solution: Provide an abstract interface for creating families of related or dependent objects
 * without specifying their concrete classes.
 */

export interface IRegistrationPolicy {
  getPolicyName(): string;
  getRequirements(): string[];
  validate(studentDepartment?: string, studentYear?: number): { valid: boolean; reason?: string };
}

export interface IEligibilityPolicy {
  getPolicyName(): string;
  getRules(): string[];
}

// ----------------------------------------------------
// Concrete Products for Technical Category
// ----------------------------------------------------
export class TechRegistrationPolicy implements IRegistrationPolicy {
  getPolicyName(): string { return 'Technical Event Policy'; }
  getRequirements(): string[] { return ['Laptop required', 'GitHub profile optional', 'Individual or Duo']; }
  validate(studentDepartment?: string, studentYear?: number) {
    return { valid: true };
  }
}

export class TechEligibilityPolicy implements IEligibilityPolicy {
  getPolicyName(): string { return 'Technical Eligibility'; }
  getRules(): string[] { return ['Basic knowledge of programming or engineering concepts required.']; }
}

// ----------------------------------------------------
// Concrete Products for Cultural Category
// ----------------------------------------------------
export class CulturalRegistrationPolicy implements IRegistrationPolicy {
  getPolicyName(): string { return 'Cultural Event Policy'; }
  getRequirements(): string[] { return ['Stage prop declaration mandatory', 'Performance track submission']; }
  validate(studentDepartment?: string, studentYear?: number) {
    return { valid: true };
  }
}

export class CulturalEligibilityPolicy implements IEligibilityPolicy {
  getPolicyName(): string { return 'Cultural Eligibility'; }
  getRules(): string[] { return ['Enrolled student status verified by student ID card.']; }
}

// ----------------------------------------------------
// Concrete Products for Sports Category
// ----------------------------------------------------
export class SportsRegistrationPolicy implements IRegistrationPolicy {
  getPolicyName(): string { return 'Sports Event Policy'; }
  getRequirements(): string[] { return ['Medical fitness declaration', 'Proper sports equipment & shoes required']; }
  validate(studentDepartment?: string, studentYear?: number) {
    return { valid: true };
  }
}

export class SportsEligibilityPolicy implements IEligibilityPolicy {
  getPolicyName(): string { return 'Sports Eligibility'; }
  getRules(): string[] { return ['Must pass pre-match health screening.']; }
}

// ----------------------------------------------------
// Abstract Factory Interface
// ----------------------------------------------------
export interface EventComponentFactory {
  createEvent(data: EventCreationData): Omit<Event, 'eventId' | 'currentRegistrations' | 'createdAt'>;
  createRegistrationPolicy(): IRegistrationPolicy;
  createEligibilityPolicy(): IEligibilityPolicy;
}

// ----------------------------------------------------
// Concrete Abstract Factories
// ----------------------------------------------------
export class TechnicalComponentFactory implements EventComponentFactory {
  private eventFactory = new TechnicalEventFactory();
  createEvent(data: EventCreationData) { return this.eventFactory.createEvent(data); }
  createRegistrationPolicy() { return new TechRegistrationPolicy(); }
  createEligibilityPolicy() { return new TechEligibilityPolicy(); }
}

export class CulturalComponentFactory implements EventComponentFactory {
  private eventFactory = new CulturalEventFactory();
  createEvent(data: EventCreationData) { return this.eventFactory.createEvent(data); }
  createRegistrationPolicy() { return new CulturalRegistrationPolicy(); }
  createEligibilityPolicy() { return new CulturalEligibilityPolicy(); }
}

export class SportsComponentFactory implements EventComponentFactory {
  private eventFactory = new SportsEventFactory();
  createEvent(data: EventCreationData) { return this.eventFactory.createEvent(data); }
  createRegistrationPolicy() { return new SportsRegistrationPolicy(); }
  createEligibilityPolicy() { return new SportsEligibilityPolicy(); }
}

export class AbstractFactoryProvider {
  public static getComponentFactory(category: string): EventComponentFactory {
    switch (category) {
      case 'Cultural':
        return new CulturalComponentFactory();
      case 'Sports':
        return new SportsComponentFactory();
      case 'Technical':
      default:
        return new TechnicalComponentFactory();
    }
  }
}
