import { API_BASE } from "./config";
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
  forgotPassword: (payload) => request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) }),
  resetPassword: (token, payload) => request(`/api/auth/reset-password/${token}`, { method: "POST", body: JSON.stringify(payload) }),
  updateProfile: (payload) => request("/api/auth/profile", { method: "PUT", body: JSON.stringify(payload) }),
  changePassword: (payload) => request("/api/auth/change-password", { method: "PUT", body: JSON.stringify(payload) }),
  updateTheme: (themePreference) => request("/api/auth/theme", { method: "PUT", body: JSON.stringify({ themePreference }) }),
  exportData: async () => {
    const token = getToken();
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}/api/auth/export`, { headers });
    if (!response.ok) throw new Error("Failed to export data");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "streakforge_data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
  resetData: () => request("/api/auth/reset-data", { method: "DELETE" }),
  deleteAccount: () => request("/api/auth/delete-account", { method: "DELETE" }),
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}/api/auth/profile-picture`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.error || "Upload failed");
    }
    return data;
  },
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
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`${API_BASE}/api/notes/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.error || "Upload failed");
    }
    return data;
  },

  // Stats
  getStats: () => request("/api/stats"),
  updateStats: (payload) => request("/api/stats", { method: "PUT", body: JSON.stringify(payload) }),
  midnight: () => request("/api/stats/midnight", { method: "POST" }),
  resetForge: () => request("/api/stats", { method: "DELETE" }),
};
