export type UserRole = 'STUDENT' | 'EVENT_ORGANIZER' | 'PLATFORM_ADMIN' | 'COLLEGE_ADMIN';

export type EventType = 'INTRA_COLLEGE' | 'INTER_COLLEGE';

export type EventStatus = 
  | 'DRAFT' 
  | 'PUBLISHED' 
  | 'REGISTRATION_OPEN' 
  | 'REGISTRATION_CLOSED' 
  | 'FULL' 
  | 'ONGOING' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REJECTED';

export type NotificationType = 
  | 'Registration Confirmation'
  | 'Event Reminder'
  | 'Event Updated'
  | 'Event Cancelled'
  | 'Registration Approved'
  | 'Registration Rejected'
  | 'Organizer Announcement'
  | 'Password Reset';

export type NotificationChannelType = 'In-App' | 'Email' | 'SMS';

export interface College {
  collegeId: number;
  name: string;
  code: string;
  location: string;
  emailDomain: string;
  status: string;
  createdAt?: string;
}

export interface User {
  userId: number;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  collegeId: number;
  department?: string;
  year?: number;
  phone?: string;
  role: UserRole;
  status: string;
  createdAt?: string;
  collegeName?: string;
}

export interface Event {
  eventId: number;
  title: string;
  description: string;
  category: string;
  eventType: EventType;
  collegeId: number;
  organizerId: number;
  organizerName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  registrationDeadline: string;
  capacity: number;
  currentRegistrations: number;
  registrationFee: number;
  eligibilityDescription: string;
  status: EventStatus;
  contactInformation: string;
  createdAt?: string;
  organizingCollegeName?: string;
}

export interface Registration {
  registrationId: number;
  eventId: number;
  studentId: number;
  registeredAt: string;
  status: RegistrationStatus;
  eventTitle?: string;
  eventCategory?: string;
  eventType?: EventType;
  eventDate?: string;
  venue?: string;
  organizingCollegeName?: string;
  studentName?: string;
  studentEmail?: string;
  studentCollegeName?: string;
  studentDepartment?: string;
}

export interface NotificationRecord {
  notificationId: number;
  userId: number;
  eventId?: number;
  type: NotificationType;
  channel: NotificationChannelType;
  message: string;
  readStatus: number;
  createdAt: string;
  eventTitle?: string;
}

export interface ContactRequest {
  contactId: number;
  studentId: number;
  organizerId: number;
  eventId: number;
  subject: string;
  message: string;
  reply?: string;
  status: string;
  createdAt: string;
  studentName?: string;
  studentEmail?: string;
  eventTitle?: string;
}

export interface RegistrationValidationResult {
  allowed: boolean;
  reason?: string;
  handlerName?: string;
}
