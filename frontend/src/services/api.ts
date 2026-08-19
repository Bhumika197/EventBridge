const API_BASE = '/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('eventbridge_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const json = await res.json();
  if (!res.ok && !json.restricted && !json.handlerName) {
    throw new Error(json.message || json.reason || 'API Request Failed');
  }
  return json;
}

export const api = {
  // Auth
  login: (credentials: any) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  registerStudent: (data: any) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) => fetchApi('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data: any) => fetchApi('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getCurrentUser: () => fetchApi('/auth/me'),
  getColleges: () => fetchApi('/auth/colleges'),

  // Events
  getEligibleEvents: () => fetchApi('/events/eligible'),
  getEventById: (id: number) => fetchApi(`/events/${id}`),
  getOrganizerEvents: () => fetchApi('/events/organizer/my-events'),
  createEvent: (data: any) => fetchApi('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id: number, data: any) => fetchApi(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelEvent: (id: number, reason: string) => fetchApi(`/events/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  sendAnnouncement: (id: number, announcement: string) => fetchApi(`/events/${id}/announcement`, { method: 'POST', body: JSON.stringify({ announcement }) }),
  contactOrganizer: (id: number, data: any) => fetchApi(`/events/${id}/contact`, { method: 'POST', body: JSON.stringify(data) }),

  // Registrations
  registerForEvent: (eventId: number) => fetchApi(`/registrations/event/${eventId}`, { method: 'POST' }),
  cancelRegistration: (regId: number) => fetchApi(`/registrations/${regId}`, { method: 'DELETE' }),
  getMyRegistrations: () => fetchApi('/registrations/my-registrations'),
  getEventRegistrations: (eventId: number) => fetchApi(`/registrations/event/${eventId}/list`),
  getNotifications: () => fetchApi('/registrations/notifications'),
  markNotificationRead: (id: number) => fetchApi(`/registrations/notifications/${id}/read`, { method: 'PUT' }),

  // Admin
  getAdminStats: () => fetchApi('/admin/stats'),
  getAllUsers: () => fetchApi('/admin/users'),
  createCollege: (data: any) => fetchApi('/admin/colleges', { method: 'POST', body: JSON.stringify(data) }),

  // Patterns Info
  getPatterns: () => fetchApi('/patterns')
};
