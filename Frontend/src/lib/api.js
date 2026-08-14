// Central API wrapper for all REST calls to the backend.
// The backend URL comes from the VITE_API_BASE_URL env var.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Generic fetch wrapper: builds the URL, sends the request with cookies
// (so the backend can identify the logged-in user), and parses the JSON body.
const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Only try to parse JSON if the server actually sent JSON.
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : null;

  // Non-2xx responses become thrown errors so callers can catch and show them.
  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body;
};

// Named API methods grouped by feature area, so pages/components never call
// fetch directly. Each method maps to one backend route.
const api = {
  // --- Poll CRUD (authenticated users) ---
  createPoll: (payload) =>
    request("/polls", { method: "POST", body: JSON.stringify(payload) }),

  getMyPolls: () => request("/polls/mine"),

  getPollById: (pollId) => request(`/polls/${pollId}`),

  updatePoll: (pollId, payload) =>
    request(`/polls/${pollId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  publishPoll: (pollId) =>
    request(`/polls/${pollId}/publish`, { method: "POST" }),

  // --- Analytics (authenticated poll owners) ---
  analyticsSummary: (pollId) => request(`/polls/${pollId}/analytics/summary`),

  analyticsQuestions: (pollId) =>
    request(`/polls/${pollId}/analytics/questions`),

  analyticsParticipation: (pollId) =>
    request(`/polls/${pollId}/analytics/participation`),

  // --- Public poll (any visitor, no auth) ---
  getPublicPoll: (slug) => request(`/public/polls/${slug}`),

  submitPublicResponse: (slug, payload) =>
    request(`/public/polls/${slug}/responses`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getPublicResults: (slug) => request(`/public/polls/${slug}/results`),
};

export default api;
