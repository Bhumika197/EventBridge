export class EventWorkflow {
  stepsLog = [];
  /**
   * The Template Method:
   * Defines the fixed skeleton of the event lifecycle workflow.
   * Concrete subclasses override only the category-specific steps.
   */
  async run(event) {
    this.stepsLog = [];
    await this.validate(event);
    await this.setupRegistration(event);
    await this.publish(event);
    await this.executeEvent(event);
    await this.close(event);
    const summary = await this.generateReport(event);
    return {
      workflowType: this.getWorkflowName(),
      eventTitle: event.title || "Institutional Event",
      category: event.category || "General",
      completedAt: (/* @__PURE__ */ new Date()).toISOString(),
      steps: this.stepsLog,
      summary
    };
  }
  // --- Fixed Invariant Steps (Implemented once in base class) ---
  async publish(event) {
    this.recordStep(
      3,
      "Publish Event to College Feed",
      false,
      "EventWorkflow (Base Class)",
      `Event "${event.title}" published live with active access-control visibility (${event.eventType || "INTER_COLLEGE"}).`
    );
  }
  async close(event) {
    this.recordStep(
      5,
      "Close Event & Registration Portal",
      false,
      "EventWorkflow (Base Class)",
      `Registration portal closed for "${event.title}". Final capacity locked; attendance marked completed.`
    );
  }
  recordStep(stepNumber, stepName, isOverridden, executedBy, output) {
    this.stepsLog.push({
      stepNumber,
      stepName,
      isOverridden,
      executedBy,
      output
    });
  }
}
export class HackathonWorkflow extends EventWorkflow {
  getWorkflowName() {
    return "HackathonWorkflow";
  }
  async validate(event) {
    const minTeam = event.minTeamSize || 2;
    const maxTeam = event.maxTeamSize || 4;
    const prize = event.prizePool || 25e3;
    this.recordStep(
      1,
      "Validate Technical & Hackathon Requirements",
      true,
      "HackathonWorkflow (Overridden)",
      `Verified developer requirements: Teams sized ${minTeam}-${maxTeam} members, GitHub repo linking mandatory, Cloud IDE sandboxes verified. Prize pool set to \u20B9${prize.toLocaleString()}.`
    );
  }
  async setupRegistration(event) {
    this.recordStep(
      2,
      "Setup Team Registration & GitHub Portal",
      true,
      "HackathonWorkflow (Overridden)",
      `Configured team portal: Capturing Team Captain details, teammates' university roll numbers, technology stack preferences, and discord invite links.`
    );
  }
  async executeEvent(event) {
    this.recordStep(
      4,
      "Conduct Coding Sprints & Judging Round",
      true,
      "HackathonWorkflow (Overridden)",
      `Initiated 24h coding sprint: Automated Git commit tracking enabled, Mid-evaluation round completed, Final demo presentation before industry jury panel.`
    );
  }
  async generateReport(event) {
    const output = `Technical Report: Evaluated submissions across Innovation, Code Quality, and Pitch. First place and runner-up trophies awarded along with prize pool disbursement.`;
    this.recordStep(
      6,
      "Generate Hackathon Analytics & Podium Report",
      true,
      "HackathonWorkflow (Overridden)",
      output
    );
    return output;
  }
}
export class CulturalFestWorkflow extends EventWorkflow {
  getWorkflowName() {
    return "CulturalFestWorkflow";
  }
  async validate(event) {
    this.recordStep(
      1,
      "Validate Stage & Performance Safety",
      true,
      "CulturalFestWorkflow (Overridden)",
      `Verified stage acoustics, lighting equipment, greenroom availability, emergency fire exits, and sound level permissions from campus administration.`
    );
  }
  async setupRegistration(event) {
    this.recordStep(
      2,
      "Setup Solo Entries & Stage Ticketing",
      true,
      "CulturalFestWorkflow (Overridden)",
      `Configured ticketing tiers: VIP Front-Row, Student General Pass, and Solo/Duet stage entry audition slots with audio track upload support.`
    );
  }
  async executeEvent(event) {
    this.recordStep(
      4,
      "Manage Live Stage Performances & Crowd Voting",
      true,
      "CulturalFestWorkflow (Overridden)",
      `Coordinated back-to-back performances: Stage call times, live acoustics mixing, audience applause tracking, and digital QR-code crowd voting.`
    );
  }
  async generateReport(event) {
    const output = `Cultural Fest Report: Sold out audience seating capacity, zero security incidents, 18 solo acts showcased, audience choice award declared.`;
    this.recordStep(
      6,
      "Generate Cultural Fest Box Office & Crowd Report",
      true,
      "CulturalFestWorkflow (Overridden)",
      output
    );
    return output;
  }
}
