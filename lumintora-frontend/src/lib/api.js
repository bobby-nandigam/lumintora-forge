// ?? instead of || so an empty string (Docker/nginx proxy mode) is preserved
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

// Exported so pages that navigate the browser directly (e.g. the Google OAuth
// redirect) build the same base URL as the fetch client, with the fallback.
export const API_BASE = BASE

const getToken = () => localStorage.getItem('lumintora_token')

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  // Auth
  register: (data) => request('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  // User
  me: () => request('/api/v1/me'),
  updateMe: (data) => request('/api/v1/me', { method: 'PATCH', body: JSON.stringify(data) }),
  activity: () => request('/api/v1/me/activity'),

  // Paths
  listPaths: () => request('/api/v1/paths'),
  getPath: (id) => request(`/api/v1/paths/${id}`),
  deletePath: (id) => request(`/api/v1/paths/${id}`, { method: 'DELETE' }),

  // Modules
  getModule: (id) => request(`/api/v1/modules/${id}`),
  getContent: (id) => request(`/api/v1/modules/${id}/content`),
  startModule: (id) => request(`/api/v1/modules/${id}/start`, { method: 'POST' }),
  completeModule: (id) => request(`/api/v1/modules/${id}/complete`, { method: 'POST' }),
  moduleFeedback: (id, feedback) => request(`/api/v1/modules/${id}/feedback`, { method: 'POST', body: JSON.stringify({ feedback }) }),
  adaptPath: (pathId, triggerModuleId) => request(`/api/v1/paths/${pathId}/adapt`, { method: 'POST', body: JSON.stringify({ trigger_module_id: triggerModuleId }) }),
  getQuiz: (id) => request(`/api/v1/modules/${id}/quiz`),
  submitQuiz: (id, answers) => request(`/api/v1/modules/${id}/quiz`, { method: 'POST', body: JSON.stringify({ answers }) }),

  // AI
  generatePath: (data) => request('/api/v1/ai/generate-path', { method: 'POST', body: JSON.stringify(data) }),
  explain: (data) => request('/api/v1/ai/explain', { method: 'POST', body: JSON.stringify(data) }),
  hint: (data) => request('/api/v1/ai/hint', { method: 'POST', body: JSON.stringify(data) }),
  evaluateCode: (data) => request('/api/v1/ai/evaluate-code', { method: 'POST', body: JSON.stringify(data) }),
  debugCode: (data) => request('/api/v1/ai/debug', { method: 'POST', body: JSON.stringify(data) }),
  generateResume: (data) => request('/api/v1/ai/generate-resume', { method: 'POST', body: JSON.stringify(data) }),

  // Multi-language code execution (python3, java, …) via the backend gateway.
  execute: (data) => request('/api/v1/execute', { method: 'POST', body: JSON.stringify(data) }),

  // Other
  joinWaitlist: (email) => request('/api/v1/waitlist', { method: 'POST', body: JSON.stringify({ email }) }),
  leaderboard: () => request('/api/v1/leaderboard'),
  submitFeedback: (data) => request('/api/v1/feedback', { method: 'POST', body: JSON.stringify(data) }),
  submitContact: (data) => request('/api/v1/contact', { method: 'POST', body: JSON.stringify(data) }),
  chat: (message, history) => request('/api/v1/chat', { method: 'POST', body: JSON.stringify({ message, history }) }),
  issueCertificate: (pathId) => request('/api/v1/certificates', { method: 'POST', body: JSON.stringify({ path_id: pathId }) }),
  verifyCertificate: (certId) => request(`/api/v1/certificates/verify?cert=${encodeURIComponent(certId)}`),
  googleComplete: (data) => request('/api/v1/auth/google/complete', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email) => request('/api/v1/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (data) => request('/api/v1/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // Forge — adaptive technical refresh
  forgeSkills: () => request('/api/v1/forge/skills'),
  forgeSkillDetail: (topicKey) => request(`/api/v1/forge/skills/${topicKey}`),
  forgeStart: (data) => request('/api/v1/forge/refresh/start', { method: 'POST', body: JSON.stringify(data) }),
  forgeDiagnostic: (sessionId, answers) => request(`/api/v1/forge/refresh/${sessionId}/diagnostic`, { method: 'POST', body: JSON.stringify({ answers }) }),
  forgeNext: (sessionId) => request(`/api/v1/forge/refresh/${sessionId}/next`, { method: 'POST' }),
  forgeAnswer: (activityId, response) => request(`/api/v1/forge/activities/${activityId}/answer`, { method: 'POST', body: JSON.stringify({ response }) }),
  forgeComplete: (sessionId) => request(`/api/v1/forge/refresh/${sessionId}/complete`, { method: 'POST' }),
  forgeTutor: (data) => request('/api/v1/forge/tutor', { method: 'POST', body: JSON.stringify(data) }),
  forgeInterviewStart: (topicKey) => request('/api/v1/forge/interview/start', { method: 'POST', body: JSON.stringify({ topic_key: topicKey || '' }) }),
  forgeInterviewReply: (id, message) => request(`/api/v1/forge/interview/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) }),
  forgeInterviewFinish: (id, delivery) => request(`/api/v1/forge/interview/${id}/finish`, { method: 'POST', body: JSON.stringify({ delivery: delivery || null }) }),
}
