const API_BASE = import.meta.env.VITE_API_BASE_URL;

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }

  return body;
};

const api = {
  // Poll APIs

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

  // Analytics APIs
  analyticsSummary: (pollId) => request(`/polls/${pollId}/analytics/summary`),

  analyticsQuestions: (pollId) =>
    request(`/polls/${pollId}/analytics/questions`),

  analyticsParticipation: (pollId) =>
    request(`/polls/${pollId}/analytics/participation`),

  // Public Poll APIs
  getPublicPoll: (slug) => request(`/public/polls/${slug}`),

  submitPublicResponse: (slug, payload) =>
    request(`/public/polls/${slug}/responses`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getPublicResults: (slug) => request(`/public/polls/${slug}/results`),
};

export default api;
