/**
 * API client for One Stop Solution backend.
 * All HTTP calls go through this module.
 */
import axios, { AxiosInstance } from 'axios';

export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

const STORAGE_KEY = 'oss_admin_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers = config.headers || ({} as any);
    (config.headers as any).Authorization = `Bearer ${t}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    if (error?.response?.status === 401) {
      setToken(null);
      // Notify the auth hook so its `isAuthenticated` state resets
      // immediately — without this the admin dashboard would stay mounted
      // showing broken-data UI until the user manually refreshes.
      try {
        window.dispatchEvent(new CustomEvent('oss:auth-expired'));
      } catch {
        /* window may be undefined in SSR — ignore */
      }
    }
    return Promise.reject(error);
  },
);

export default api;

/* -------------------------------------------------------------
 * Session ID — used for visit tracking. Generated once per
 * browser session (persisted to localStorage so repeat visits
 * by the same user within ~24h are correlated).
 * ----------------------------------------------------------- */
const SESSION_KEY = 'oss_session_id';
function _getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `s-${Date.now()}`;
  }
}

/* -------------------------------------------------------------
 * Type definitions — match backend Pydantic schemas.
 * ----------------------------------------------------------- */
export interface ApiTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  specialties: string[];
  isOnline: boolean;
  email: string;
}

export interface ApiSubService {
  id: string;
  name: string;
  accentColor: string;
  textColor: string;
  tailwindColor: string;
  description: string;
}

export interface ApiPortfolioItem {
  id: string;
  title: string;
  skills: string[];
  description: string;
  mediaType: string;
  mediaUrl: string;
  mediaTitle: string;
  thumbnailUrl: string;
}

export interface ApiService {
  id: string;
  slug: string;
  name: string;
  accentColor: string;
  textColor: string;
  tailwindColor: string;
  shortDesc: string;
  overallDescription: string;
  iconName: string;
  imageAsset?: string;
  subServices: ApiSubService[];
  portfolio: ApiPortfolioItem[];
}

export interface ApiEnquiry {
  id: string;
  name: string;
  contactMethod: 'email' | 'whatsapp' | 'other';
  contactInfo: string;
  subject: string;
  message: string;
  selectedService: string;
  timezone: string;
  isAnswered: boolean;
  timestamp: string;
}

export interface ApiConsultation {
  id: string;
  name: string;
  email: string;
  country: string;
  selectedDateTime: string;
  timezone: string;
  pktTime: string;
  isAnswered: boolean;
  timestamp: string;
}

export interface ApiRating {
  id: string;
  serviceId: string;
  name: string;
  designation: string;
  company: string;
  country: string;
  avatarUrl: string;
  comment: string;
  ratingStars: number;
  isApproved: boolean;
}

export interface ApiResource {
  id: string;
  category: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  downloadCount: number;
}

export interface ApiSiteStats {
  clients: number;
  orders: number;
  countries: number;
  label: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  display_name?: string;
}

/* -------------------------------------------------------------
 * Mappers — backend uses snake_case + integer ids; the existing
 * frontend components expect camelCase + string ids.
 * ----------------------------------------------------------- */
function mapTeamMember(t: any): ApiTeamMember {
  return {
    id: String(t.id),
    name: t.name,
    role: t.role,
    bio: t.bio,
    avatarUrl: t.avatar_url,
    specialties: t.specialties || [],
    isOnline: t.is_online,
    email: t.email,
  };
}

function mapSubService(s: any): ApiSubService {
  return {
    id: String(s.id),
    name: s.name,
    accentColor: s.accent_color,
    textColor: s.text_color,
    tailwindColor: s.tailwind_color,
    description: s.description,
  };
}

function mapPortfolio(p: any): ApiPortfolioItem {
  return {
    id: String(p.id),
    title: p.title,
    skills: p.skills || [],
    description: p.description,
    mediaType: p.media_type,
    mediaUrl: p.media_url,
    mediaTitle: p.media_title,
    thumbnailUrl: p.thumbnail_url,
  };
}

function mapService(s: any): ApiService {
  return {
    id: s.slug, // frontend uses slug as the public id
    slug: s.slug,
    name: s.name,
    accentColor: s.accent_color,
    textColor: s.text_color,
    tailwindColor: s.tailwind_color,
    shortDesc: s.short_desc,
    overallDescription: s.overall_description || '',
    iconName: s.icon_name,
    imageAsset: s.image_asset,
    subServices: (s.sub_services || []).map(mapSubService),
    portfolio: (s.portfolio || []).map(mapPortfolio),
  };
}

function mapEnquiry(e: any): ApiEnquiry {
  return {
    id: String(e.id),
    name: e.name,
    contactMethod: e.contact_method,
    contactInfo: e.contact_info,
    subject: e.subject,
    message: e.message,
    selectedService: e.selected_service,
    timezone: e.timezone,
    isAnswered: e.is_answered,
    timestamp: e.timestamp,
  };
}

function mapConsultation(c: any): ApiConsultation {
  return {
    id: String(c.id),
    name: c.name,
    email: c.email,
    country: c.country,
    selectedDateTime: c.selected_date_time,
    timezone: c.timezone,
    pktTime: c.pkt_time,
    isAnswered: c.is_answered,
    timestamp: c.timestamp,
  };
}

function mapRating(r: any): ApiRating {
  return {
    id: String(r.id),
    serviceId: r.service_id,
    name: r.name,
    designation: r.designation,
    company: r.company,
    country: r.country,
    avatarUrl: r.avatar_url,
    comment: r.comment,
    ratingStars: r.rating_stars,
    isApproved: r.is_approved,
  };
}

function mapResource(r: any): ApiResource {
  return {
    id: String(r.id),
    category: r.category,
    title: r.title,
    description: r.description,
    fileType: r.file_type,
    fileSize: r.file_size,
    downloadCount: r.download_count,
  };
}

/* -------------------------------------------------------------
 * Public API methods
 * ----------------------------------------------------------- */
export const apiClient = {
  // ---- Auth ----
  async login(username: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', { username, password });
    return data;
  },
  async getMe(): Promise<any> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  // ---- Public data ----
  async getServices(): Promise<ApiService[]> {
    const { data } = await api.get('/services/');
    return data.map(mapService);
  },
  async getApprovedRatings(): Promise<ApiRating[]> {
    const { data } = await api.get('/ratings/', { params: { approved: true } });
    return data.map(mapRating);
  },
  async getAllRatings(): Promise<ApiRating[]> {
    // Admin-only: returns BOTH approved and unapproved ratings. The backend
    // /ratings/?approved=all route requires a valid admin bearer token.
    const { data } = await api.get('/ratings/', { params: { approved: 'all' } });
    return data.map(mapRating);
  },
  async getResources(): Promise<ApiResource[]> {
    const { data } = await api.get('/resources/');
    return data.map(mapResource);
  },
  async incrementResourceDownload(resourceId: string): Promise<ApiResource> {
    const { data } = await api.post(`/resources/${resourceId}/download`);
    return mapResource(data);
  },
  async getTeamMembers(): Promise<ApiTeamMember[]> {
    const { data } = await api.get('/team/');
    return data.map(mapTeamMember);
  },
  async getStats(): Promise<ApiSiteStats> {
    const { data } = await api.get('/stats/');
    return data;
  },

  // ---- Public submissions ----
  async createEnquiry(payload: Omit<ApiEnquiry, 'id' | 'isAnswered' | 'timestamp'>): Promise<ApiEnquiry> {
    const { data } = await api.post('/enquiries/', payload);
    return mapEnquiry(data);
  },
  async createConsultation(payload: Omit<ApiConsultation, 'id' | 'isAnswered' | 'timestamp'>): Promise<ApiConsultation> {
    const { data } = await api.post('/consultations/', {
      name: payload.name,
      email: payload.email,
      country: payload.country,
      selected_date_time: payload.selectedDateTime,
      timezone: payload.timezone,
      pkt_time: payload.pktTime,
    });
    return mapConsultation(data);
  },
  async createRating(payload: Omit<ApiRating, 'id'>): Promise<ApiRating> {
    // Convert camelCase payload → snake_case for the backend Pydantic schema
    // (RatingCreate). Without this, fields like `serviceId` / `isApproved`
    // would 422 against the backend's expected `service_id` / `is_approved`.
    const body: any = {};
    Object.entries(payload).forEach(([k, v]) => {
      const snake = k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
      body[snake] = v;
    });
    const { data } = await api.post('/ratings/', body);
    return mapRating(data);
  },

  // ---- Admin data ----
  async getEnquiries(): Promise<ApiEnquiry[]> {
    const { data } = await api.get('/enquiries/');
    return data.map(mapEnquiry);
  },
  async updateEnquiry(id: string, patch: Partial<ApiEnquiry>): Promise<ApiEnquiry> {
    const body: any = {};
    if (patch.isAnswered !== undefined) body.is_answered = patch.isAnswered;
    if (patch.subject !== undefined) body.subject = patch.subject;
    if (patch.message !== undefined) body.message = patch.message;
    if (patch.selectedService !== undefined) body.selected_service = patch.selectedService;
    if (patch.contactInfo !== undefined) body.contact_info = patch.contactInfo;
    if (patch.contactMethod !== undefined) body.contact_method = patch.contactMethod;
    if (patch.name !== undefined) body.name = patch.name;
    if (patch.timezone !== undefined) body.timezone = patch.timezone;
    const { data } = await api.put(`/enquiries/${id}`, body);
    return mapEnquiry(data);
  },
  async deleteEnquiry(id: string): Promise<void> {
    await api.delete(`/enquiries/${id}`);
  },

  async getConsultations(): Promise<ApiConsultation[]> {
    const { data } = await api.get('/consultations/');
    return data.map(mapConsultation);
  },
  async updateConsultation(id: string, patch: Partial<ApiConsultation>): Promise<ApiConsultation> {
    const body: any = {};
    if (patch.isAnswered !== undefined) body.is_answered = patch.isAnswered;
    if (patch.name !== undefined) body.name = patch.name;
    if (patch.email !== undefined) body.email = patch.email;
    if (patch.country !== undefined) body.country = patch.country;
    if (patch.selectedDateTime !== undefined) body.selected_date_time = patch.selectedDateTime;
    if (patch.timezone !== undefined) body.timezone = patch.timezone;
    if (patch.pktTime !== undefined) body.pkt_time = patch.pktTime;
    const { data } = await api.put(`/consultations/${id}`, body);
    return mapConsultation(data);
  },
  async deleteConsultation(id: string): Promise<void> {
    await api.delete(`/consultations/${id}`);
  },

  async updateRating(id: string, patch: Partial<ApiRating>): Promise<ApiRating> {
    const body: any = {};
    Object.entries(patch).forEach(([k, v]) => {
      const snake = k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
      body[snake] = v;
    });
    const { data } = await api.put(`/ratings/${id}`, body);
    return mapRating(data);
  },
  async deleteRating(id: string): Promise<void> {
    await api.delete(`/ratings/${id}`);
  },

  async updateStats(patch: Partial<ApiSiteStats>): Promise<ApiSiteStats> {
    const { data } = await api.put('/stats/', patch);
    return data;
  },

  async updateTeamMember(id: string, patch: Partial<ApiTeamMember>): Promise<ApiTeamMember> {
    const body: any = {};
    if (patch.name !== undefined) body.name = patch.name;
    if (patch.role !== undefined) body.role = patch.role;
    if (patch.bio !== undefined) body.bio = patch.bio;
    if (patch.avatarUrl !== undefined) body.avatar_url = patch.avatarUrl;
    if (patch.specialties !== undefined) body.specialties = patch.specialties;
    if (patch.isOnline !== undefined) body.is_online = patch.isOnline;
    if (patch.email !== undefined) body.email = patch.email;
    const { data } = await api.put(`/team/${id}`, body);
    return mapTeamMember(data);
  },
  async deleteTeamMember(id: string): Promise<void> {
    await api.delete(`/team/${id}`);
  },

  // ---- Reorder (admin) ----
  async reorderServices(items: { id: number; sort_order: number }[]): Promise<void> {
    await api.put('/services/reorder', { items });
  },
  async reorderPortfolio(items: { id: number; sort_order: number }[]): Promise<void> {
    await api.put('/services/portfolio/reorder', { items });
  },
  async reorderRatings(items: { id: number; sort_order: number }[]): Promise<void> {
    await api.put('/ratings/reorder', { items });
  },
  async reorderTeam(items: { id: number; sort_order: number }[]): Promise<void> {
    await api.put('/team/reorder', { items });
  },
  async reorderFaqs(items: { id: number; sort_order: number }[]): Promise<void> {
    await api.put('/faqs/reorder', { items });
  },

  // ---- Services (admin CRUD) ----
  async createService(payload: any): Promise<ApiService> {
    const { data } = await api.post('/services/', payload);
    return mapService(data);
  },
  async updateService(id: string | number, payload: any): Promise<ApiService> {
    // The API uses numeric ids for services, but the frontend uses slugs as id.
    // We resolve slug → numeric id via the services list endpoint before PATCH.
    const numericId = await resolveServiceId(id);
    const { data } = await api.put(`/services/${numericId}`, payload);
    return mapService(data);
  },
  async deleteService(id: string | number): Promise<void> {
    const numericId = await resolveServiceId(id);
    await api.delete(`/services/${numericId}`);
  },

  // ---- Portfolio items (admin CRUD, nested under services) ----
  async createPortfolioItem(serviceId: string | number, payload: any): Promise<ApiPortfolioItem> {
    const numericId = await resolveServiceId(serviceId);
    const { data } = await api.post(`/services/${numericId}/portfolio`, payload);
    return mapPortfolio(data);
  },
  async updatePortfolioItem(portfolioId: number, payload: any): Promise<ApiPortfolioItem> {
    const { data } = await api.put(`/services/portfolio/${portfolioId}`, payload);
    return mapPortfolio(data);
  },
  async deletePortfolioItem(portfolioId: number): Promise<void> {
    await api.delete(`/services/portfolio/${portfolioId}`);
  },

  // ---- FAQ ----
  async getFaqs(activeOnly: boolean = true): Promise<any[]> {
    const { data } = await api.get('/faqs/', { params: { active_only: activeOnly } });
    return data;
  },
  async createFaq(payload: { question: string; answer: string }): Promise<any> {
    const { data } = await api.post('/faqs/', payload);
    return data;
  },
  async updateFaq(id: number, payload: any): Promise<any> {
    const { data } = await api.put(`/faqs/${id}`, payload);
    return data;
  },
  async deleteFaq(id: number): Promise<void> {
    await api.delete(`/faqs/${id}`);
  },

  // ---- Contact platforms ----
  async getContactPlatforms(activeOnly: boolean = true): Promise<any[]> {
    const { data } = await api.get('/contact-platforms/', { params: { active_only: activeOnly } });
    return data;
  },
  async createContactPlatform(payload: any): Promise<any> {
    const { data } = await api.post('/contact-platforms/', payload);
    return data;
  },
  async updateContactPlatform(id: number, payload: any): Promise<any> {
    const { data } = await api.put(`/contact-platforms/${id}`, payload);
    return data;
  },
  async deleteContactPlatform(id: number): Promise<void> {
    await api.delete(`/contact-platforms/${id}`);
  },

  // ---- Certifications ----
  async getCertifications(teamMemberId?: number): Promise<any[]> {
    const params: any = {};
    if (teamMemberId !== undefined) params.team_member_id = teamMemberId;
    const { data } = await api.get('/certifications/', { params });
    return data;
  },
  async createCertification(payload: any): Promise<any> {
    const { data } = await api.post('/certifications/', payload);
    return data;
  },
  async deleteCertification(id: number): Promise<void> {
    await api.delete(`/certifications/${id}`);
  },

  // ---- Dashboard analytics ----
  async getDashboard(): Promise<any> {
    const { data } = await api.get('/stats/dashboard');
    return data;
  },

  // ---- Visits (admin) ----
  async getVisits(): Promise<any> {
    const { data } = await api.get('/visits/');
    return data;
  },
  async getVisitsByCountry(): Promise<any> {
    const { data } = await api.get('/visits/by-country');
    return data;
  },
  /**
   * Fire-and-forget visit tracking — called once per page load on the public
   * site. The backend records IP → country + path + timestamp and uses this
   * to populate the Analytics tab in the admin dashboard. We swallow all
   * errors so a dead analytics endpoint never breaks the public site.
   */
  async trackVisit(): Promise<void> {
    try {
      await api.post('/visits/', {}, {
        headers: { 'X-Session-Id': _getSessionId() },
      });
    } catch {
      /* analytics is best-effort */
    }
  },

  // ---- Uploads (admin) ----
  async uploadPortfolioImage(file: File): Promise<{ url: string; filename: string; size: number; content_type: string }> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/uploads/portfolio', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async uploadResourceFile(file: File): Promise<{ url: string; filename: string; size: number; content_type: string }> {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await api.post('/uploads/resource', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // ---- Admin users (admin) ----
  async getAdminUsers(): Promise<any[]> {
    const { data } = await api.get('/admin-users/');
    return data;
  },
  async getMeAdmin(): Promise<any> {
    const { data } = await api.get('/admin-users/me');
    return data;
  },
  async createAdminUser(payload: { username: string; password: string; display_name?: string; is_active?: boolean }): Promise<any> {
    const { data } = await api.post('/admin-users/', payload);
    return data;
  },
  async updateAdminUser(id: number, payload: any): Promise<any> {
    const { data } = await api.put(`/admin-users/${id}`, payload);
    return data;
  },
  async deleteAdminUser(id: number): Promise<void> {
    await api.delete(`/admin-users/${id}`);
  },

  // ---- Team member create (admin) ----
  async createTeamMember(payload: any): Promise<ApiTeamMember> {
    const { data } = await api.post('/team/', payload);
    return mapTeamMember(data);
  },

  // ---- Resources (admin CRUD) ----
  async createResource(payload: any): Promise<ApiResource> {
    const { data } = await api.post('/resources/', payload);
    return mapResource(data);
  },
  async updateResource(id: string, payload: any): Promise<ApiResource> {
    const { data } = await api.put(`/resources/${id}`, payload);
    return mapResource(data);
  },
  async deleteResource(id: string): Promise<void> {
    await api.delete(`/resources/${id}`);
  },

  // ---- Chatbot ----
  async sendChatMessage(message: string, sessionId?: string): Promise<{
    reply: string;
    intent: string;
    source_faq_id: number | null;
    suggestions: string[];
  }> {
    const { data } = await api.post('/chatbot/', { message, session_id: sessionId });
    return data;
  },
  async getChatSuggestions(): Promise<string[]> {
    const { data } = await api.get('/chatbot/suggestions');
    return data.suggestions || [];
  },
};

/**
 * Resolve a slug-based service id (as used by the frontend) into the
 * numeric id required by the backend PUT/DELETE routes. We fetch the
 * services list once and cache it in-module to avoid repeating calls.
 */
let _serviceIdCache: Record<string, number> | null = null;
async function resolveServiceId(slugOrId: string | number): Promise<number> {
  if (typeof slugOrId === 'number') return slugOrId;
  if (_serviceIdCache && slugOrId in _serviceIdCache) return _serviceIdCache[slugOrId];
  // Refresh cache
  const { data } = await api.get('/services/');
  _serviceIdCache = {};
  for (const s of data) {
    _serviceIdCache[String(s.id)] = s.id;
    if (s.slug) _serviceIdCache[s.slug] = s.id;
  }
  if (slugOrId in _serviceIdCache!) return _serviceIdCache[slugOrId];
  throw new Error(`Service not found for id/slug: ${slugOrId}`);
}
