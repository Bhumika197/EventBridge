export class Colleague {
  mediator = null;
  setMediator(mediator) {
    this.mediator = mediator;
  }
}
export class SeatColleague extends Colleague {
  async checkAndReserveSeat(event) {
    const current = event.currentRegistrations || 0;
    const capacity = event.capacity || 100;
    const available = current < capacity;
    if (this.mediator) {
      await this.mediator.notify(
        this,
        available ? "SEAT_RESERVED" : "SEAT_UNAVAILABLE_WAITLIST",
        { available, current, capacity }
      );
    }
    return {
      available,
      queuePosition: available ? void 0 : (event.waitlistCount || 0) + 1
    };
  }
}
export class PaymentColleague extends Colleague {
  async processPayment(fee, student) {
    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1e3)}`;
    const paid = true;
    if (this.mediator) {
      await this.mediator.notify(
        this,
        fee === 0 ? "FEE_WAIVED" : "PAYMENT_PROCESSED",
        { fee, transactionId, studentName: student.name }
      );
    }
    return { paid, transactionId };
  }
}
export class NotificationColleague extends Colleague {
  async sendConfirmation(student, event, isWaitlist) {
    const message = isWaitlist ? `Waitlist confirmation sent to ${student.email || "student"} for "${event.title}".` : `Official ticket and registration confirmation sent to ${student.email || "student"} for "${event.title}".`;
    if (this.mediator) {
      await this.mediator.notify(this, "EMAIL_DISPATCHED", { message, email: student.email });
    }
    return true;
  }
}
export class DashboardColleague extends Colleague {
  async updateOrganizerDashboard(organizerId, eventId, status) {
    if (this.mediator) {
      await this.mediator.notify(this, "DASHBOARD_ROSTER_UPDATED", {
        organizerId,
        eventId,
        status,
        note: `Organizer #${organizerId} live dashboard roster updated (+1 ${status} attendee).`
      });
    }
    return true;
  }
}
export class EventCoordinator {
  seatColleague;
  paymentColleague;
  notifColleague;
  dashColleague;
  logs = [];
  constructor(seat, payment, notif, dash) {
    this.seatColleague = seat || new SeatColleague();
    this.paymentColleague = payment || new PaymentColleague();
    this.notifColleague = notif || new NotificationColleague();
    this.dashColleague = dash || new DashboardColleague();
    this.seatColleague.setMediator(this);
    this.paymentColleague.setMediator(this);
    this.notifColleague.setMediator(this);
    this.dashColleague.setMediator(this);
  }
  async notify(sender, eventName, data) {
    let colleagueName = "UnknownColleague";
    if (sender instanceof SeatColleague) colleagueName = "SeatColleague";
    else if (sender instanceof PaymentColleague) colleagueName = "PaymentColleague";
    else if (sender instanceof NotificationColleague) colleagueName = "NotificationColleague";
    else if (sender instanceof DashboardColleague) colleagueName = "DashboardColleague";
    this.logs.push({
      step: this.logs.length + 1,
      colleague: colleagueName,
      action: eventName,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      details: data ? JSON.stringify(data) : "No extra data"
    });
  }
  /**
   * Main mediator coordination method:
   * Sequence:
   * 1. Check and reserve seat via SeatColleague
   * 2. Process payment via PaymentColleague
   * 3. Send email confirmation via NotificationColleague
   * 4. Refresh organizer dashboard and roster via DashboardColleague
   */
  async coordinateRegistration(student, event, feeOverride) {
    this.logs = [];
    const seatResult = await this.seatColleague.checkAndReserveSeat(event);
    const feeToPay = feeOverride !== void 0 ? feeOverride : event.registrationFee || 0;
    const paymentResult = await this.paymentColleague.processPayment(feeToPay, student);
    const notifResult = await this.notifColleague.sendConfirmation(student, event, !seatResult.available);
    const dashResult = await this.dashColleague.updateOrganizerDashboard(
      event.organizerId || 1,
      event.eventId || 1,
      seatResult.available ? "CONFIRMED" : "WAITLISTED"
    );
    return {
      success: true,
      status: seatResult.available ? "CONFIRMED" : "WAITLISTED",
      seatConfirmed: seatResult.available,
      paymentCleared: paymentResult.paid,
      emailSent: notifResult,
      dashboardUpdated: dashResult,
      feePaid: feeToPay,
      logs: this.logs
    };
  }
  getLogs() {
    return this.logs;
  }
}
