import { Event } from '../../types';

export interface WorkflowStepLog {
  stepNumber: number;
  stepName: string;
  isOverridden: boolean;
  executedBy: string;
  output: string;
}

export interface WorkflowReport {
  workflowType: string;
  eventTitle: string;
  category: string;
  completedAt: string;
  steps: WorkflowStepLog[];
  summary: string;
}

/**
 * Abstract Class defining the Template Method pattern for Event Lifecycle.
 */
export abstract class EventWorkflow {
  protected stepsLog: WorkflowStepLog[] = [];

  /**
   * The Template Method:
   * Defines the fixed skeleton of the event lifecycle workflow.
   * Concrete subclasses override only the category-specific steps.
   */
  public async run(event: Partial<Event>): Promise<WorkflowReport> {
    this.stepsLog = [];

    // Step 1: Validation (Hook / Overridden by subclass)
    await this.validate(event);

    // Step 2: Setup Registration (Hook / Overridden by subclass)
    await this.setupRegistration(event);

    // Step 3: Publish (Fixed Invariant in Base Class)
    await this.publish(event);

    // Step 4: Execute Event (Hook / Overridden by subclass)
    await this.executeEvent(event);

    // Step 5: Close Registration/Event (Fixed Invariant in Base Class)
    await this.close(event);

    // Step 6: Generate Post-Event Report (Hook / Overridden by subclass)
    const summary = await this.generateReport(event);

    return {
      workflowType: this.getWorkflowName(),
      eventTitle: event.title || 'Institutional Event',
      category: event.category || 'General',
      completedAt: new Date().toISOString(),
      steps: this.stepsLog,
      summary
    };
  }

  public abstract getWorkflowName(): string;

  // --- Primitive / Hook Steps (Subclasses override) ---
  protected abstract validate(event: Partial<Event>): Promise<void>;
  protected abstract setupRegistration(event: Partial<Event>): Promise<void>;
  protected abstract executeEvent(event: Partial<Event>): Promise<void>;
  protected abstract generateReport(event: Partial<Event>): Promise<string>;

  // --- Fixed Invariant Steps (Implemented once in base class) ---
  protected async publish(event: Partial<Event>): Promise<void> {
    this.recordStep(
      3,
      'Publish Event to College Feed',
      false,
      'EventWorkflow (Base Class)',
      `Event "${event.title}" published live with active access-control visibility (${event.eventType || 'INTER_COLLEGE'}).`
    );
  }

  protected async close(event: Partial<Event>): Promise<void> {
    this.recordStep(
      5,
      'Close Event & Registration Portal',
      false,
      'EventWorkflow (Base Class)',
      `Registration portal closed for "${event.title}". Final capacity locked; attendance marked completed.`
    );
  }

  protected recordStep(
    stepNumber: number,
    stepName: string,
    isOverridden: boolean,
    executedBy: string,
    output: string
  ) {
    this.stepsLog.push({
      stepNumber,
      stepName,
      isOverridden,
      executedBy,
      output
    });
  }
}

/**
 * Concrete Workflow 1: HackathonWorkflow
 * Implements team-based coding registration, repository submissions, and judging rounds.
 */
export class HackathonWorkflow extends EventWorkflow {
  public getWorkflowName(): string {
    return 'HackathonWorkflow';
  }

  protected async validate(event: Partial<Event>): Promise<void> {
    const minTeam = event.minTeamSize || 2;
    const maxTeam = event.maxTeamSize || 4;
    const prize = event.prizePool || 25000;

    this.recordStep(
      1,
      'Validate Technical & Hackathon Requirements',
      true,
      'HackathonWorkflow (Overridden)',
      `Verified developer requirements: Teams sized ${minTeam}-${maxTeam} members, GitHub repo linking mandatory, Cloud IDE sandboxes verified. Prize pool set to ₹${prize.toLocaleString()}.`
    );
  }

  protected async setupRegistration(event: Partial<Event>): Promise<void> {
    this.recordStep(
      2,
      'Setup Team Registration & GitHub Portal',
      true,
      'HackathonWorkflow (Overridden)',
      `Configured team portal: Capturing Team Captain details, teammates' university roll numbers, technology stack preferences, and discord invite links.`
    );
  }

  protected async executeEvent(event: Partial<Event>): Promise<void> {
    this.recordStep(
      4,
      'Conduct Coding Sprints & Judging Round',
      true,
      'HackathonWorkflow (Overridden)',
      `Initiated 24h coding sprint: Automated Git commit tracking enabled, Mid-evaluation round completed, Final demo presentation before industry jury panel.`
    );
  }

  protected async generateReport(event: Partial<Event>): Promise<string> {
    const output = `Technical Report: Evaluated submissions across Innovation, Code Quality, and Pitch. First place and runner-up trophies awarded along with prize pool disbursement.`;
    this.recordStep(
      6,
      'Generate Hackathon Analytics & Podium Report',
      true,
      'HackathonWorkflow (Overridden)',
      output
    );
    return output;
  }
}

/**
 * Concrete Workflow 2: CulturalFestWorkflow
 * Implements solo entries, ticketing tiers, stage management, and audience polling.
 */
export class CulturalFestWorkflow extends EventWorkflow {
  public getWorkflowName(): string {
    return 'CulturalFestWorkflow';
  }

  protected async validate(event: Partial<Event>): Promise<void> {
    this.recordStep(
      1,
      'Validate Stage & Performance Safety',
      true,
      'CulturalFestWorkflow (Overridden)',
      `Verified stage acoustics, lighting equipment, greenroom availability, emergency fire exits, and sound level permissions from campus administration.`
    );
  }

  protected async setupRegistration(event: Partial<Event>): Promise<void> {
    this.recordStep(
      2,
      'Setup Solo Entries & Stage Ticketing',
      true,
      'CulturalFestWorkflow (Overridden)',
      `Configured ticketing tiers: VIP Front-Row, Student General Pass, and Solo/Duet stage entry audition slots with audio track upload support.`
    );
  }

  protected async executeEvent(event: Partial<Event>): Promise<void> {
    this.recordStep(
      4,
      'Manage Live Stage Performances & Crowd Voting',
      true,
      'CulturalFestWorkflow (Overridden)',
      `Coordinated back-to-back performances: Stage call times, live acoustics mixing, audience applause tracking, and digital QR-code crowd voting.`
    );
  }

  protected async generateReport(event: Partial<Event>): Promise<string> {
    const output = `Cultural Fest Report: Sold out audience seating capacity, zero security incidents, 18 solo acts showcased, audience choice award declared.`;
    this.recordStep(
      6,
      'Generate Cultural Fest Box Office & Crowd Report',
      true,
      'CulturalFestWorkflow (Overridden)',
      output
    );
    return output;
  }
}
