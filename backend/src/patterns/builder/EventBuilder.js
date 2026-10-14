export class EventBuilder {
  title;
  description;
  category = "Technical";
  eventType = "INTER_COLLEGE";
  collegeId;
  organizerId;
  organizerName;
  date;
  startTime = "09:00 AM";
  endTime = "05:00 PM";
  venue = "Main Auditorium";
  registrationStartTime;
  registrationDeadline;
  capacity = 100;
  registrationFee = 0;
  eligibilityDescription;
  status = "DRAFT";
  contactInformation;
  prizePool = 0;
  minTeamSize = 1;
  maxTeamSize = 1;
  speakers = [];
  sponsors = [];
  // --- Step 1: Core Required Fields ---
  setTitle(title) {
    this.title = title ? title.trim() : "";
    return this;
  }
  setDate(date) {
    this.date = date ? date.trim() : "";
    return this;
  }
  setCollege(collegeId) {
    this.collegeId = collegeId;
    return this;
  }
  // --- Step 2: Schedule & Logistics ---
  setSchedule(startTime, endTime) {
    this.startTime = startTime;
    this.endTime = endTime;
    return this;
  }
  setVenue(venue) {
    this.venue = venue ? venue.trim() : "";
    return this;
  }
  setRegistrationDeadline(deadline) {
    this.registrationDeadline = deadline ? deadline.trim() : "";
    return this;
  }
  setCapacity(capacity) {
    this.capacity = capacity;
    return this;
  }
  // --- Step 3: Scope & Category ---
  setCategory(category) {
    this.category = category;
    return this;
  }
  setInterCollege(isInterCollege) {
    this.eventType = isInterCollege ? "INTER_COLLEGE" : "INTRA_COLLEGE";
    return this;
  }
  setEventType(eventType) {
    this.eventType = eventType;
    return this;
  }
  // --- Step 4: Optional Fields & Extras ---
  setDescription(description) {
    this.description = description ? description.trim() : "";
    return this;
  }
  setPrizePool(amount) {
    this.prizePool = Math.max(0, amount || 0);
    return this;
  }
  setTeamSize(min, max) {
    this.minTeamSize = Math.max(1, min || 1);
    this.maxTeamSize = Math.max(this.minTeamSize, max || this.minTeamSize);
    return this;
  }
  addSpeaker(speaker) {
    if (speaker && speaker.trim()) {
      this.speakers.push(speaker.trim());
    }
    return this;
  }
  setSpeakers(speakers) {
    this.speakers = speakers ? [...speakers] : [];
    return this;
  }
  addSponsor(sponsor) {
    if (sponsor && sponsor.trim()) {
      this.sponsors.push(sponsor.trim());
    }
    return this;
  }
  setSponsors(sponsors) {
    this.sponsors = sponsors ? [...sponsors] : [];
    return this;
  }
  setRegistrationFee(fee) {
    this.registrationFee = Math.max(0, fee || 0);
    return this;
  }
  setOrganizer(organizerId, organizerName) {
    this.organizerId = organizerId;
    this.organizerName = organizerName;
    return this;
  }
  setEligibilityDescription(desc) {
    this.eligibilityDescription = desc;
    return this;
  }
  setContactInformation(contact) {
    this.contactInformation = contact;
    return this;
  }
  setStatus(status) {
    this.status = status;
    return this;
  }
  // --- Validation & Assembly ---
  validate() {
    const errors = [];
    if (!this.title || this.title.length === 0) {
      errors.push("Event title is required.");
    }
    if (!this.date || this.date.length === 0) {
      errors.push("Event date is required.");
    }
    if (!this.collegeId || this.collegeId <= 0) {
      errors.push("Organizing college is required.");
    }
    if (this.capacity <= 0) {
      errors.push("Capacity must be at least 1 seat.");
    }
    if (this.registrationDeadline && this.date) {
      const deadlineTime = new Date(this.registrationDeadline).getTime();
      const eventTime = new Date(this.date).getTime();
      if (!isNaN(deadlineTime) && !isNaN(eventTime) && deadlineTime > eventTime) {
        errors.push("Registration deadline cannot be after the event date.");
      }
    }
    if (this.minTeamSize > this.maxTeamSize) {
      errors.push(`Minimum team size (${this.minTeamSize}) cannot exceed maximum team size (${this.maxTeamSize}).`);
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }
  build() {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`EventBuilder Validation Failed: ${validation.errors.join(" ")}`);
    }
    return {
      title: this.title,
      description: this.description || `${this.title} at ${this.venue}. Join us for an exciting campus experience!`,
      category: this.category,
      eventType: this.eventType,
      collegeId: this.collegeId,
      organizerId: this.organizerId || 1,
      organizerName: this.organizerName || "College Organizing Committee",
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      venue: this.venue,
      registrationStartTime: this.registrationStartTime,
      registrationDeadline: this.registrationDeadline || this.date,
      capacity: this.capacity,
      registrationFee: this.registrationFee,
      eligibilityDescription: this.eligibilityDescription || (this.eventType === "INTRA_COLLEGE" ? "Host institution students only." : "Open to enrolled students across colleges."),
      status: this.status,
      contactInformation: this.contactInformation || `Inquiries: ${this.organizerName || "Organizers"}`,
      prizePool: this.prizePool,
      minTeamSize: this.minTeamSize,
      maxTeamSize: this.maxTeamSize,
      speakers: [...this.speakers],
      sponsors: [...this.sponsors],
      isInterCollege: this.eventType === "INTER_COLLEGE"
    };
  }
}
