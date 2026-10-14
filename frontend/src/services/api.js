const API_BASE = "/api";
export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem("eventbridge_token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  let res;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error("Unable to connect to the backend server. Please ensure the server is running on http://localhost:5000.");
  }
  const contentType = res.headers.get("content-type") || "";
  let json = null;
  if (contentType.includes("application/json")) {
    try {
      json = await res.json();
    } catch {
      throw new Error(`Server returned invalid JSON (${res.status} ${res.statusText})`);
    }
  } else {
    const text = await res.text();
    if (!res.ok) {
      const isHtml = text.includes("<html") || text.includes("<!DOCTYPE") || text.includes("<body");
      const cleanMessage = isHtml ? `Server error (${res.status} ${res.statusText || "Internal Server Error"}). Please ensure the backend server is running.` : text.slice(0, 200) || `Server error (${res.status} ${res.statusText})`;
      throw new Error(cleanMessage);
    }
    return text;
  }
  if (!res.ok && !json.restricted && !json.handlerName && json.status !== "WAITLISTED") {
    throw new Error(json.message || json.reason || `API Request Failed (${res.status})`);
  }
  return json;
}
export const api = {
  // Auth
  login: (credentials) => fetchApi("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  registerStudent: (data) => fetchApi("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  forgotPassword: (email) => fetchApi("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (data) => fetchApi("/auth/reset-password", { method: "POST", body: JSON.stringify(data) }),
  getCurrentUser: () => fetchApi("/auth/me"),
  getColleges: () => fetchApi("/auth/colleges"),
  deleteAccount: (data) => fetchApi("/auth/delete-account", { method: "POST", body: JSON.stringify(data) }),
  // Events
  getEligibleEvents: () => fetchApi("/events/eligible"),
  getPaginatedEvents: (params) => {
    const cleanParams = {};
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== void 0 && val !== null && val !== "") {
          cleanParams[key] = String(val);
        }
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return fetchApi(`/events${query ? `?${query}` : ""}`);
  },
  getEventById: (id) => fetchApi(`/events/${id}`),
  getOrganizerEvents: () => fetchApi("/events/organizer/my-events"),
  getPendingReviews: () => fetchApi("/events/pending-reviews"),
  createEvent: (data) => fetchApi("/events", { method: "POST", body: JSON.stringify(data) }),
  submitForReview: (id) => fetchApi(`/events/${id}/submit`, { method: "POST" }),
  reviewEvent: (id, decision, rejectionReason) => fetchApi(`/events/${id}/review`, { method: "POST", body: JSON.stringify({ decision, rejectionReason }) }),
  updateEvent: (id, data) => fetchApi(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  cancelEvent: (id, reason) => fetchApi(`/events/${id}/cancel`, { method: "POST", body: JSON.stringify({ reason }) }),
  sendAnnouncement: (id, announcement) => fetchApi(`/events/${id}/announcement`, { method: "POST", body: JSON.stringify({ announcement }) }),
  contactOrganizer: (id, data) => fetchApi(`/events/${id}/contact`, { method: "POST", body: JSON.stringify(data) }),
  // Registrations
  registerForEvent: (eventId) => fetchApi(`/registrations/event/${eventId}`, { method: "POST" }),
  cancelRegistration: (regId) => fetchApi(`/registrations/${regId}`, { method: "DELETE" }),
  getMyRegistrations: () => fetchApi("/registrations/my-registrations"),
  getEventRegistrations: (eventId) => fetchApi(`/registrations/event/${eventId}/list`),
  getNotifications: () => fetchApi("/registrations/notifications"),
  markNotificationRead: (id) => fetchApi(`/registrations/notifications/${id}/read`, { method: "PUT" }),
  // Admin
  getAdminStats: () => fetchApi("/admin/stats"),
  getAllUsers: () => fetchApi("/admin/users"),
  createCollege: (data) => fetchApi("/admin/colleges", { method: "POST", body: JSON.stringify(data) }),
  // Pattern-Powered Features
  cloneEvent: (id, overrides) => fetchApi(`/events/${id}/clone`, { method: "POST", body: JSON.stringify(overrides || {}) }),
  undoEventEdit: (id) => fetchApi(`/events/${id}/memento/undo`, { method: "POST" }),
  getEventHistory: (id) => fetchApi(`/events/${id}/memento/history`),
  validateBuilder: (data) => fetchApi("/events/builder/validate", { method: "POST", body: JSON.stringify(data) }),
  runWorkflow: (workflowType, event) => fetchApi("/events/workflow/run", { method: "POST", body: JSON.stringify({ workflowType, event }) }),
  simulateMediator: (data) => fetchApi("/events/mediator/simulate", { method: "POST", body: JSON.stringify(data || {}) }),
  calculateFee: (strategy, context) => fetchApi("/events/pricing/calculate", { method: "POST", body: JSON.stringify({ strategy, context }) }),
  // Patterns Info
  getPatterns: () => fetchApi("/patterns")
};
