const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const TOKEN_KEY = "streakforge_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.detail || data.error || "Request failed.";
    const err = new Error(errorMsg);
    if (response.status === 403 && data.needsVerification) {
      err.needsVerification = true;
    }
    throw err;
  }
  return data;
}

export const api = {
  // Authentication
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  signup: (payload) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/api/auth/me"),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  resendVerification: (payload) => request("/api/auth/resend-verification", { method: "POST", body: JSON.stringify(payload) }),
  verifyEmail: (token) => request(`/api/auth/verify-email/${token}`),
  setToken,
  getToken,
  clearToken,

  // Habits
  getHabits: () => request("/api/habits"),
  createHabit: (payload) => request("/api/habits", { method: "POST", body: JSON.stringify(payload) }),
  updateHabit: (id, payload) => request(`/api/habits/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteHabit: (id) => request(`/api/habits/${id}`, { method: "DELETE" }),

  // Events
  getEvents: () => request("/api/events"),
  getArchivedEvents: () => request("/api/events/archive"),
  createEvent: (payload) => request("/api/events", { method: "POST", body: JSON.stringify(payload) }),
  updateEvent: (id, payload) => request(`/api/events/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteEvent: (id) => request(`/api/events/${id}`, { method: "DELETE" }),

  // Notes
  getNotes: () => request("/api/notes"),
  createNote: (payload) => request("/api/notes", { method: "POST", body: JSON.stringify(payload) }),
  deleteNote: (id) => request(`/api/notes/${id}`, { method: "DELETE" }),

  // Stats
  getStats: () => request("/api/stats"),
  updateStats: (payload) => request("/api/stats", { method: "PUT", body: JSON.stringify(payload) }),
  midnight: () => request("/api/stats/midnight", { method: "POST" }),
  resetForge: () => request("/api/stats", { method: "DELETE" }),
};
