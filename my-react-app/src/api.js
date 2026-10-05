import axios from "axios";

export const getApiBaseUrl = () => {
  if (typeof window === "undefined") return "http://127.0.0.1:8000";

  const saved = localStorage.getItem("custom_api_url");
  if (saved) {
    const clean = saved.replace(/\/+$/, "");
    return clean.endsWith("/account") ? clean.replace(/\/account\/?$/, "") : clean;
  }

  const hostname = window.location.hostname;
  const isCapacitorNative = Boolean(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.isNative);

  if (isCapacitorNative || hostname === "localhost" || hostname === "127.0.0.1" || hostname === "") {
    return "http://127.0.0.1:8000";
  }

  return `http://${hostname}:8000`;
};

export const getMediaUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export const api = {
  // Auth
  login: (credentials) => axios.post(`${getApiBaseUrl()}/account/login/`, credentials),
  register: (data) => axios.post(`${getApiBaseUrl()}/account/register/`, data),
  logout: () => axios.post(`${getApiBaseUrl()}/account/logout/`),
  
  // Profile
  getProfile: (userId) => axios.get(`${getApiBaseUrl()}/account/profile/${userId ? `${userId}/` : ""}`),
  updateProfile: (data) => axios.post(`${getApiBaseUrl()}/account/profile/`, data),
  
  // Resumes
  getResumes: (userId) => axios.get(`${getApiBaseUrl()}/account/resumes/${userId ? `?user_id=${userId}` : ""}`),
  uploadResume: (formData) => axios.post(`${getApiBaseUrl()}/account/resumes/`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  deleteResume: (id) => axios.delete(`${getApiBaseUrl()}/account/resumes/${id}/`),

  // Jobs
  getJobs: (params = {}) => axios.get(`${getApiBaseUrl()}/job/jobs/`, { params }),
  getJobDetail: (id) => axios.get(`${getApiBaseUrl()}/job/jobs/${id}/`),
  createJob: (data) => axios.post(`${getApiBaseUrl()}/job/jobs/`, data),
  updateJob: (id, data) => axios.put(`${getApiBaseUrl()}/job/jobs/${id}/`, data),
  deleteJob: (id) => axios.delete(`${getApiBaseUrl()}/job/jobs/${id}/`),

  // Saved Jobs
  getSavedJobs: (userId) => axios.get(`${getApiBaseUrl()}/job/saved-jobs/${userId ? `?user_id=${userId}` : ""}`),
  saveJob: (jobId, userId) => axios.post(`${getApiBaseUrl()}/job/saved-jobs/`, { job_id: jobId, user_id: userId }),
  removeSavedJob: (jobId, userId) => axios.delete(`${getApiBaseUrl()}/job/saved-jobs/`, { data: { job_id: jobId, user_id: userId } }),

  // Companies & Metadata
  getCompanies: () => axios.get(`${getApiBaseUrl()}/job/companies/`),
  createCompany: (data) => axios.post(`${getApiBaseUrl()}/job/companies/`, data),
  getCategories: () => axios.get(`${getApiBaseUrl()}/job/categories/`),
  getSkills: () => axios.get(`${getApiBaseUrl()}/job/skills/`),

  // Recruitment & Applications
  getApplications: (params = {}) => axios.get(`${getApiBaseUrl()}/recruitment/applications/`, { params }),
  submitApplication: (data) => axios.post(`${getApiBaseUrl()}/recruitment/applications/`, data),
  updateApplicationStatus: (appId, data) => axios.patch(`${getApiBaseUrl()}/recruitment/applications/${appId}/`, data),
  
  // Notifications
  getNotifications: (userId) => axios.get(`${getApiBaseUrl()}/recruitment/notifications/${userId ? `?user_id=${userId}` : ""}`),
  markNotificationsRead: (userId) => axios.patch(`${getApiBaseUrl()}/recruitment/notifications/`, { user_id: userId }),
};
