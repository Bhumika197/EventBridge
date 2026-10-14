export class EventPrototype {
  title;
  description;
  category;
  eventType;
  collegeId;
  organizerId;
  organizerName;
  date;
  startTime;
  endTime;
  venue;
  registrationStartTime;
  registrationDeadline;
  capacity;
  registrationFee;
  eligibilityDescription;
  status;
  contactInformation;
  prizePool;
  minTeamSize;
  maxTeamSize;
  speakers;
  sponsors;
  constructor(event) {
    this.title = event.title || "Untitled Event";
    this.description = event.description || "";
    this.category = event.category || "Technical";
    this.eventType = event.eventType || "INTER_COLLEGE";
    this.collegeId = event.collegeId || 1;
    this.organizerId = event.organizerId || 1;
    this.organizerName = event.organizerName || "Organizer";
    this.date = event.date || "";
    this.startTime = event.startTime || "09:00 AM";
    this.endTime = event.endTime || "05:00 PM";
    this.venue = event.venue || "";
    this.registrationStartTime = event.registrationStartTime;
    this.registrationDeadline = event.registrationDeadline || event.date || "";
    this.capacity = event.capacity || 100;
    this.registrationFee = event.registrationFee || 0;
    this.eligibilityDescription = event.eligibilityDescription || "Open to enrolled students.";
    this.status = "DRAFT";
    this.contactInformation = event.contactInformation || "";
    this.prizePool = event.prizePool || 0;
    this.minTeamSize = event.minTeamSize || 1;
    this.maxTeamSize = event.maxTeamSize || 1;
    if (Array.isArray(event.speakers)) {
      this.speakers = [...event.speakers];
    } else if (typeof event.speakers === "string") {
      try {
        this.speakers = JSON.parse(event.speakers);
      } catch {
        this.speakers = [];
      }
    } else {
      this.speakers = [];
    }
    if (Array.isArray(event.sponsors)) {
      this.sponsors = [...event.sponsors];
    } else if (typeof event.sponsors === "string") {
      try {
        this.sponsors = JSON.parse(event.sponsors);
      } catch {
        this.sponsors = [];
      }
    } else {
      this.sponsors = [];
    }
  }
  /**
   * Prototype clone() method:
   * Creates an exact deep clone of the event, deep-copying arrays (speakers, sponsors),
   * resetting operational state (currentRegistrations=0, status=DRAFT),
   * and optionally applying organizer adjustments like new date and venue.
   */
  clone(overrides) {
    const cloned = new EventPrototype({
      title: overrides?.title || `${this.title} (Clone)`,
      description: this.description,
      category: this.category,
      eventType: this.eventType,
      collegeId: this.collegeId,
      organizerId: this.organizerId,
      organizerName: this.organizerName,
      date: overrides?.date || this.date,
      startTime: overrides?.startTime || this.startTime,
      endTime: overrides?.endTime || this.endTime,
      venue: overrides?.venue || this.venue,
      registrationStartTime: void 0,
      registrationDeadline: overrides?.registrationDeadline || overrides?.date || this.registrationDeadline,
      capacity: this.capacity,
      registrationFee: this.registrationFee,
      eligibilityDescription: this.eligibilityDescription,
      status: "DRAFT",
      contactInformation: this.contactInformation,
      prizePool: this.prizePool,
      minTeamSize: this.minTeamSize,
      maxTeamSize: this.maxTeamSize,
      speakers: [...this.speakers],
      // Deep copy
      sponsors: [...this.sponsors]
      // Deep copy
    });
    return cloned;
  }
  toEventCreationData() {
    return {
      title: this.title,
      description: this.description,
      category: this.category,
      eventType: this.eventType,
      collegeId: this.collegeId,
      organizerId: this.organizerId,
      organizerName: this.organizerName,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      venue: this.venue,
      registrationStartTime: this.registrationStartTime,
      registrationDeadline: this.registrationDeadline,
      capacity: this.capacity,
      registrationFee: this.registrationFee,
      eligibilityDescription: this.eligibilityDescription,
      status: "DRAFT",
      contactInformation: this.contactInformation,
      prizePool: this.prizePool,
      minTeamSize: this.minTeamSize,
      maxTeamSize: this.maxTeamSize,
      speakers: [...this.speakers],
      sponsors: [...this.sponsors],
      isInterCollege: this.eventType === "INTER_COLLEGE"
    };
  }
}
