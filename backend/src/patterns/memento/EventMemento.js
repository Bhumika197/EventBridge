import { MementoRepository } from "../../repositories/MementoRepository.js";
export class EventMemento {
  state;
  timestamp;
  description;
  constructor(state, description = "Snapshot before update") {
    this.state = JSON.parse(JSON.stringify(state));
    this.timestamp = (/* @__PURE__ */ new Date()).toISOString();
    this.description = description;
  }
  getState() {
    return JSON.parse(JSON.stringify(this.state));
  }
  getTimestamp() {
    return this.timestamp;
  }
  getDescription() {
    return this.description;
  }
  serialize() {
    return JSON.stringify({
      state: this.state,
      timestamp: this.timestamp,
      description: this.description
    });
  }
  static deserialize(serialized) {
    const data = JSON.parse(serialized);
    const m = new EventMemento(data.state, data.description);
    m.timestamp = data.timestamp;
    return m;
  }
}
export class EventOriginator {
  state;
  constructor(event) {
    this.state = this.extractSnapshot(event);
  }
  extractSnapshot(event) {
    let speakers = [];
    if (Array.isArray(event.speakers)) {
      speakers = [...event.speakers];
    } else if (typeof event.speakers === "string") {
      try {
        speakers = JSON.parse(event.speakers);
      } catch {
        speakers = [];
      }
    }
    let sponsors = [];
    if (Array.isArray(event.sponsors)) {
      sponsors = [...event.sponsors];
    } else if (typeof event.sponsors === "string") {
      try {
        sponsors = JSON.parse(event.sponsors);
      } catch {
        sponsors = [];
      }
    }
    return {
      title: event.title || "",
      description: event.description || "",
      category: event.category || "Technical",
      eventType: event.eventType || "INTER_COLLEGE",
      date: event.date || "",
      startTime: event.startTime || "09:00 AM",
      endTime: event.endTime || "05:00 PM",
      venue: event.venue || "",
      registrationDeadline: event.registrationDeadline || event.date || "",
      capacity: event.capacity || 100,
      registrationFee: event.registrationFee || 0,
      eligibilityDescription: event.eligibilityDescription || "",
      contactInformation: event.contactInformation || "",
      prizePool: event.prizePool || 0,
      speakers,
      sponsors
    };
  }
  updateState(changes) {
    this.state = {
      ...this.state,
      ...changes
    };
  }
  getState() {
    return { ...this.state };
  }
  /**
   * Saves current state into a new Memento
   */
  saveToMemento(changeDescription) {
    return new EventMemento(this.state, changeDescription);
  }
  /**
   * Restores state from a Memento
   */
  restoreFromMemento(memento) {
    this.state = memento.getState();
    return {
      title: this.state.title,
      description: this.state.description,
      category: this.state.category,
      eventType: this.state.eventType,
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
export class EventHistoryCaretaker {
  inMemoryStack = [];
  mementoRepo;
  eventId;
  constructor(eventId) {
    this.eventId = eventId;
    this.mementoRepo = new MementoRepository();
  }
  async pushSnapshot(originator, description) {
    const memento = originator.saveToMemento(description);
    this.inMemoryStack.push(memento);
    if (this.eventId) {
      await this.mementoRepo.saveMemento(this.eventId, memento.serialize(), description);
    }
    return memento;
  }
  async undo(originator) {
    if (this.eventId) {
      const poppedRecord = await this.mementoRepo.popLatestMemento(this.eventId);
      if (poppedRecord) {
        const memento2 = EventMemento.deserialize(poppedRecord.stateJson);
        return originator.restoreFromMemento(memento2);
      }
    }
    const memento = this.inMemoryStack.pop();
    if (memento) {
      return originator.restoreFromMemento(memento);
    }
    return null;
  }
  getStackSize() {
    return this.inMemoryStack.length;
  }
  async getHistoryRecords() {
    if (this.eventId) {
      const records = await this.mementoRepo.getHistory(this.eventId);
      return records.map((r) => ({
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
