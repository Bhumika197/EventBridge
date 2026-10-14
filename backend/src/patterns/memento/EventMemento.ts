import { Event } from '../../types';
import { MementoRepository } from '../../repositories/MementoRepository';

export interface EventStateSnapshot {
  title: string;
  description: string;
  category: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  registrationDeadline: string;
  capacity: number;
  registrationFee: number;
  eligibilityDescription: string;
  contactInformation: string;
  prizePool: number;
  speakers: string[];
  sponsors: string[];
}

/**
 * EventMemento:
 * Immutable object that stores the internal state snapshot of an Event.
 */
export class EventMemento {
  private readonly state: EventStateSnapshot;
  private readonly timestamp: string;
  private readonly description: string;

  constructor(state: EventStateSnapshot, description: string = 'Snapshot before update') {
    // Deep clone to enforce immutability
    this.state = JSON.parse(JSON.stringify(state));
    this.timestamp = new Date().toISOString();
    this.description = description;
  }

  public getState(): EventStateSnapshot {
    // Return deep copy so callers cannot mutate internal snapshot
    return JSON.parse(JSON.stringify(this.state));
  }

  public getTimestamp(): string {
    return this.timestamp;
  }

  public getDescription(): string {
    return this.description;
  }

  public serialize(): string {
    return JSON.stringify({
      state: this.state,
      timestamp: this.timestamp,
      description: this.description
    });
  }

  public static deserialize(serialized: string): EventMemento {
    const data = JSON.parse(serialized);
    const m = new EventMemento(data.state, data.description);
    (m as any).timestamp = data.timestamp;
    return m;
  }
}

/**
 * EventOriginator:
 * Creates mementos containing snapshots of its current state,
 * and restores its state from a given memento.
 */
export class EventOriginator {
  private state: EventStateSnapshot;

  constructor(event: Partial<Event>) {
    this.state = this.extractSnapshot(event);
  }

  private extractSnapshot(event: Partial<Event>): EventStateSnapshot {
    let speakers: string[] = [];
    if (Array.isArray(event.speakers)) {
      speakers = [...event.speakers];
    } else if (typeof event.speakers === 'string') {
      try { speakers = JSON.parse(event.speakers); } catch { speakers = []; }
    }

    let sponsors: string[] = [];
    if (Array.isArray(event.sponsors)) {
      sponsors = [...event.sponsors];
    } else if (typeof event.sponsors === 'string') {
      try { sponsors = JSON.parse(event.sponsors); } catch { sponsors = []; }
    }

    return {
      title: event.title || '',
      description: event.description || '',
      category: event.category || 'Technical',
      eventType: event.eventType || 'INTER_COLLEGE',
      date: event.date || '',
      startTime: event.startTime || '09:00 AM',
      endTime: event.endTime || '05:00 PM',
      venue: event.venue || '',
      registrationDeadline: event.registrationDeadline || event.date || '',
      capacity: event.capacity || 100,
      registrationFee: event.registrationFee || 0,
      eligibilityDescription: event.eligibilityDescription || '',
      contactInformation: event.contactInformation || '',
      prizePool: event.prizePool || 0,
      speakers,
      sponsors
    };
  }

  public updateState(changes: Partial<EventStateSnapshot>) {
    this.state = {
      ...this.state,
      ...changes
    };
  }

  public getState(): EventStateSnapshot {
    return { ...this.state };
  }

  /**
   * Saves current state into a new Memento
   */
  public saveToMemento(changeDescription: string): EventMemento {
    return new EventMemento(this.state, changeDescription);
  }

  /**
   * Restores state from a Memento
   */
  public restoreFromMemento(memento: EventMemento): Partial<Event> {
    this.state = memento.getState();
    return {
      title: this.state.title,
      description: this.state.description,
      category: this.state.category,
      eventType: this.state.eventType as any,
      date: this.state.date,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      venue: this.state.venue,
      registrationDeadline: this.state.registrationDeadline,
      capacity: this.state.capacity,
      registrationFee: this.state.registrationFee,
      eligibilityDescription: this.state.eligibilityDescription,
      contactInformation: this.state.contactInformation,
      prizePool: this.state.prizePool,
      speakers: this.state.speakers,
      sponsors: this.state.sponsors
    };
  }
}

/**
 * EventHistoryCaretaker:
 * Manages the stack of mementos for an event, allowing Undo operations.
 */
export class EventHistoryCaretaker {
  private inMemoryStack: EventMemento[] = [];
  private mementoRepo: MementoRepository;
  private eventId?: number;

  constructor(eventId?: number) {
    this.eventId = eventId;
    this.mementoRepo = new MementoRepository();
  }

  public async pushSnapshot(originator: EventOriginator, description: string): Promise<EventMemento> {
    const memento = originator.saveToMemento(description);
    this.inMemoryStack.push(memento);

    if (this.eventId) {
      await this.mementoRepo.saveMemento(this.eventId, memento.serialize(), description);
    }

    return memento;
  }

  public async undo(originator: EventOriginator): Promise<Partial<Event> | null> {
    // If persistent repo has memento for eventId, pop from database
    if (this.eventId) {
      const poppedRecord = await this.mementoRepo.popLatestMemento(this.eventId);
      if (poppedRecord) {
        const memento = EventMemento.deserialize(poppedRecord.stateJson);
        return originator.restoreFromMemento(memento);
      }
    }

    // Fallback to in-memory stack
    const memento = this.inMemoryStack.pop();
    if (memento) {
      return originator.restoreFromMemento(memento);
    }

    return null;
  }

  public getStackSize(): number {
    return this.inMemoryStack.length;
  }

  public async getHistoryRecords(): Promise<{ id: number; description: string; timestamp: string }[]> {
    if (this.eventId) {
      const records = await this.mementoRepo.getHistory(this.eventId);
      return records.map(r => ({
        id: r.mementoId,
        description: r.description,
        timestamp: r.createdAt
      }));
    }

    return this.inMemoryStack.map((m, idx) => ({
      id: idx + 1,
      description: m.getDescription(),
      timestamp: m.getTimestamp()
    }));
  }
}
