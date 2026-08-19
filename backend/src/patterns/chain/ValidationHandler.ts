import { User, Event, RegistrationValidationResult } from '../../types';

export interface ValidationContext {
  student?: User;
  event: Event;
  isAlreadyRegistered?: boolean;
}

/**
 * CHAIN OF RESPONSIBILITY DESIGN PATTERN
 * 
 * Problem: Registration validation requires a series of checks (Auth, Status, Visibility, Eligibility, Deadline, Capacity, Duplicate).
 * Hardcoding all checks into a single massive function makes validation rigid and hard to test or extend.
 * 
 * Solution: Pass registration requests along a chain of handlers. Each handler decides either to process the request
 * or pass it to the next handler in the chain.
 */
export abstract class ValidationHandler {
  private nextHandler: ValidationHandler | null = null;

  public setNext(handler: ValidationHandler): ValidationHandler {
    this.nextHandler = handler;
    return handler;
  }

  public async handle(context: ValidationContext): Promise<RegistrationValidationResult> {
    const result = await this.validate(context);
    if (!result.allowed) {
      return result; // Stop chain immediately if check fails
    }

    if (this.nextHandler) {
      return this.nextHandler.handle(context);
    }

    return { allowed: true };
  }

  protected abstract validate(context: ValidationContext): Promise<RegistrationValidationResult>;
}
