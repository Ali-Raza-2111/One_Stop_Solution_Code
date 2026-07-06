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
    }
    return Promise.reject(error);
  },
);

export default api;

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
    const { data } = await api.get('/ratings/');
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
    const { data } = await api.post('/ratings/', payload);
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
};
