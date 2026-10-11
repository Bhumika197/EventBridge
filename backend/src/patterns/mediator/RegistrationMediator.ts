import { Event, User } from '../../types';

export interface MediatorLogEntry {
  step: number;
  colleague: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface RegistrationMediatorResult {
  success: boolean;
  status: 'CONFIRMED' | 'WAITLISTED' | 'FAILED';
  seatConfirmed: boolean;
  paymentCleared: boolean;
  emailSent: boolean;
  dashboardUpdated: boolean;
  feePaid: number;
  logs: MediatorLogEntry[];
}

export interface Mediator {
  notify(sender: Colleague, event: string, data?: any): Promise<any>;
}

export abstract class Colleague {
  protected mediator: Mediator | null = null;

  public setMediator(mediator: Mediator) {
    this.mediator = mediator;
  }
}

/**
 * 1. SeatColleague: Handles capacity checks and seat reservation.
 * Never interacts directly with Payment, Notification, or Dashboard.
 */
export class SeatColleague extends Colleague {
  public async checkAndReserveSeat(event: Partial<Event>): Promise<{ available: boolean; queuePosition?: number }> {
    const current = event.currentRegistrations || 0;
    const capacity = event.capacity || 100;
    const available = current < capacity;

    if (this.mediator) {
      await this.mediator.notify(
        this,
        available ? 'SEAT_RESERVED' : 'SEAT_UNAVAILABLE_WAITLIST',
        { available, current, capacity }
      );
    }

    return {
      available,
      queuePosition: available ? undefined : (event.waitlistCount || 0) + 1
    };
  }
}

/**
 * 2. PaymentColleague: Handles fee deduction and transaction settlement.
 * Never interacts directly with Seat, Notification, or Dashboard.
 */
export class PaymentColleague extends Colleague {
  public async processPayment(fee: number, student: Partial<User>): Promise<{ paid: boolean; transactionId: string }> {
    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const paid = true;

    if (this.mediator) {
      await this.mediator.notify(
        this,
        fee === 0 ? 'FEE_WAIVED' : 'PAYMENT_PROCESSED',
        { fee, transactionId, studentName: student.name }
      );
    }

    return { paid, transactionId };
  }
}

/**
 * 3. NotificationColleague: Dispatches student email and in-app alerts.
 * Never interacts directly with Seat, Payment, or Dashboard.
 */
export class NotificationColleague extends Colleague {
  public async sendConfirmation(student: Partial<User>, event: Partial<Event>, isWaitlist: boolean): Promise<boolean> {
    const message = isWaitlist
      ? `Waitlist confirmation sent to ${student.email || 'student'} for "${event.title}".`
      : `Official ticket and registration confirmation sent to ${student.email || 'student'} for "${event.title}".`;

    if (this.mediator) {
      await this.mediator.notify(this, 'EMAIL_DISPATCHED', { message, email: student.email });
    }

    return true;
  }
}

/**
 * 4. DashboardColleague: Updates the organizer's live dashboard and roster.
 * Never interacts directly with Seat, Payment, or Notification.
 */
export class DashboardColleague extends Colleague {
  public async updateOrganizerDashboard(organizerId: number, eventId: number, status: string): Promise<boolean> {
    if (this.mediator) {
      await this.mediator.notify(this, 'DASHBOARD_ROSTER_UPDATED', {
        organizerId,
        eventId,
        status,
        note: `Organizer #${organizerId} live dashboard roster updated (+1 ${status} attendee).`
      });
    }

    return true;
  }
}

/**
 * EventCoordinator (Concrete Mediator):
 * Central hub coordinating SeatColleague, PaymentColleague, NotificationColleague,
 * and DashboardColleague without them calling each other directly.
 */
export class EventCoordinator implements Mediator {
  private seatColleague: SeatColleague;
  private paymentColleague: PaymentColleague;
  private notifColleague: NotificationColleague;
  private dashColleague: DashboardColleague;
  private logs: MediatorLogEntry[] = [];

  constructor(
    seat?: SeatColleague,
    payment?: PaymentColleague,
    notif?: NotificationColleague,
    dash?: DashboardColleague
  ) {
    this.seatColleague = seat || new SeatColleague();
    this.paymentColleague = payment || new PaymentColleague();
    this.notifColleague = notif || new NotificationColleague();
    this.dashColleague = dash || new DashboardColleague();

    this.seatColleague.setMediator(this);
    this.paymentColleague.setMediator(this);
    this.notifColleague.setMediator(this);
    this.dashColleague.setMediator(this);
  }

  public async notify(sender: Colleague, eventName: string, data?: any): Promise<void> {
    let colleagueName = 'UnknownColleague';
    if (sender instanceof SeatColleague) colleagueName = 'SeatColleague';
    else if (sender instanceof PaymentColleague) colleagueName = 'PaymentColleague';
    else if (sender instanceof NotificationColleague) colleagueName = 'NotificationColleague';
    else if (sender instanceof DashboardColleague) colleagueName = 'DashboardColleague';

    this.logs.push({
      step: this.logs.length + 1,
      colleague: colleagueName,
      action: eventName,
      timestamp: new Date().toISOString(),
      details: data ? JSON.stringify(data) : 'No extra data'
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
  public async coordinateRegistration(
    student: Partial<User>,
    event: Partial<Event>,
    feeOverride?: number
  ): Promise<RegistrationMediatorResult> {
    this.logs = [];

    // Step 1: Seat Check
    const seatResult = await this.seatColleague.checkAndReserveSeat(event);

    const feeToPay = feeOverride !== undefined ? feeOverride : (event.registrationFee || 0);

    // Step 2: Payment
    const paymentResult = await this.paymentColleague.processPayment(feeToPay, student);

    // Step 3: Notification
    const notifResult = await this.notifColleague.sendConfirmation(student, event, !seatResult.available);

    // Step 4: Dashboard Update
    const dashResult = await this.dashColleague.updateOrganizerDashboard(
      event.organizerId || 1,
      event.eventId || 1,
      seatResult.available ? 'CONFIRMED' : 'WAITLISTED'
    );

    return {
      success: true,
      status: seatResult.available ? 'CONFIRMED' : 'WAITLISTED',
      seatConfirmed: seatResult.available,
      paymentCleared: paymentResult.paid,
      emailSent: notifResult,
      dashboardUpdated: dashResult,
      feePaid: feeToPay,
      logs: this.logs
    };
  }

  public getLogs(): MediatorLogEntry[] {
    return this.logs;
  }
}
