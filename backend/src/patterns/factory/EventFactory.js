export class EventFactory {
}
export class TechnicalEventFactory extends EventFactory {
  createEvent(data) {
    return {
      ...data,
      category: "Technical",
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || "Open to all students with interest in programming, engineering, or computing.",
      status: data.status || "DRAFT",
      contactInformation: data.contactInformation || `Tech Cell: ${data.organizerName}`
    };
  }
}
export class CulturalEventFactory extends EventFactory {
  createEvent(data) {
    return {
      ...data,
      category: "Cultural",
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || "Open to all enrolled students with valid institutional student ID.",
      status: data.status || "DRAFT",
      contactInformation: data.contactInformation || `Cultural Committee: ${data.organizerName}`
    };
  }
}
export class SportsEventFactory extends EventFactory {
  createEvent(data) {
    return {
      ...data,
      category: "Sports",
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || "Physical fitness required. Proper athletic wear mandatory.",
      status: data.status || "DRAFT",
      contactInformation: data.contactInformation || `Sports Department: ${data.organizerName}`
    };
  }
}
export class WorkshopEventFactory extends EventFactory {
  createEvent(data) {
    return {
      ...data,
      category: "Workshop",
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || "Interactive hands-on session. Bringing a laptop is recommended.",
      status: data.status || "DRAFT",
      contactInformation: data.contactInformation || `Workshop Coordinator: ${data.organizerName}`
    };
  }
}
export class SeminarEventFactory extends EventFactory {
  createEvent(data) {
    return {
      ...data,
      category: "Seminar",
      registrationFee: data.registrationFee ?? 0,
      eligibilityDescription: data.eligibilityDescription || "Open to all undergraduate and postgraduate students.",
      status: data.status || "DRAFT",
      contactInformation: data.contactInformation || `Seminar Desk: ${data.organizerName}`
    };
  }
}
export class EventFactoryProvider {
  static factories = {
    "Technical": new TechnicalEventFactory(),
    "Cultural": new CulturalEventFactory(),
    "Sports": new SportsEventFactory(),
    "Workshop": new WorkshopEventFactory(),
    "Seminar": new SeminarEventFactory(),
    "Management": new TechnicalEventFactory(),
    "Literary": new CulturalEventFactory(),
    "Arts": new CulturalEventFactory(),
    "Social": new CulturalEventFactory(),
    "Social/Community": new CulturalEventFactory()
  };
  static getFactory(category) {
    return this.factories[category] || new TechnicalEventFactory();
  }
}
