/**
 * Custom React hooks for fetching & mutating backend data.
 *
 * Each hook encapsulates loading/error state and exposes simple
 * mutation functions that automatically refresh the relevant list.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  apiClient,
  ApiService,
  ApiRating,
  ApiResource,
  ApiTeamMember,
  ApiSiteStats,
  ApiEnquiry,
  ApiConsultation,
  getToken,
  setToken,
} from '../api/client';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/* ------------------- useSiteData -------------------
 * Loads ALL public site data (services, ratings, resources,
 * team, stats) in parallel on mount. Used by the public site.
 */
export function useSiteData() {
  const [services, setServices] = useState<ApiService[]>([]);
  const [ratings, setRatings] = useState<ApiRating[]>([]);
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [teamMembers, setTeamMembers] = useState<ApiTeamMember[]>([]);
  const [stats, setStats] = useState<ApiSiteStats>({ clients: 0, orders: 0, countries: 0, label: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r, res, t, st] = await Promise.all([
        apiClient.getServices(),
        apiClient.getApprovedRatings(),
        apiClient.getResources(),
        apiClient.getTeamMembers(),
        apiClient.getStats(),
      ]);
      setServices(s);
      setRatings(r);
      setResources(res);
      setTeamMembers(t);
      setStats(st);
    } catch (e: any) {
      setError(e?.message || 'Failed to load site data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    services,
    ratings,
    resources,
    teamMembers,
    stats,
    loading,
    error,
    refresh,
    setStats,
  };
}

/* ------------------- useAdminAuth ------------------- */
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getToken());
  const [checking, setChecking] = useState<boolean>(!!getToken());

  useEffect(() => {
    // If a token exists in storage, verify it's still valid
    const t = getToken();
    if (!t) {
      setChecking(false);
      return;
    }
    apiClient
      .getMe()
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        setToken(null);
        setIsAuthenticated(false);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiClient.login(username, password);
    setToken(res.token);
    setIsAuthenticated(true);
    return res;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, checking, login, logout };
}

/* ------------------- useAdminData -------------------
 * Loads all admin-only data (enquiries, consultations,
 * all ratings including unapproved). Used by AdminDashboard.
 */
export function useAdminData() {
  const [enquiries, setEnquiries] = useState<ApiEnquiry[]>([]);
  const [consultations, setConsultations] = useState<ApiConsultation[]>([]);
  const [allRatings, setAllRatings] = useState<ApiRating[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [e, c, r] = await Promise.all([
        apiClient.getEnquiries(),
        apiClient.getConsultations(),
        apiClient.getAllRatings(),
      ]);
      setEnquiries(e);
      setConsultations(c);
      setAllRatings(r);
    } catch (err) {
      // ignore — auth issues handled by interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  /* ---- Mutations ---- */
  const toggleEnquiryAnswered = useCallback(async (id: string, isAnswered: boolean) => {
    // Optimistic update
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, isAnswered } : e)));
    try {
      const updated = await apiClient.updateEnquiry(id, { isAnswered });
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } catch {
      // Revert on failure
      setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, isAnswered: !isAnswered } : e)));
    }
  }, []);

  const deleteEnquiry = useCallback(async (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
    try {
      await apiClient.deleteEnquiry(id);
    } catch {
      // Re-fetch on failure
      refreshAll();
    }
  }, [refreshAll]);

  const toggleConsultationAnswered = useCallback(async (id: string, isAnswered: boolean) => {
    setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, isAnswered } : c)));
    try {
      const updated = await apiClient.updateConsultation(id, { isAnswered });
      setConsultations((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      setConsultations((prev) => prev.map((c) => (c.id === id ? { ...c, isAnswered: !isAnswered } : c)));
    }
  }, []);

  const deleteConsultation = useCallback(async (id: string) => {
    setConsultations((prev) => prev.filter((c) => c.id !== id));
    try {
      await apiClient.deleteConsultation(id);
    } catch {
      refreshAll();
    }
  }, [refreshAll]);

  const toggleRatingApproval = useCallback(async (id: string, isApproved: boolean) => {
    setAllRatings((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved } : r)));
    try {
      const updated = await apiClient.updateRating(id, { isApproved });
      setAllRatings((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch {
      setAllRatings((prev) => prev.map((r) => (r.id === id ? { ...r, isApproved: !isApproved } : r)));
    }
  }, []);

  const deleteRating = useCallback(async (id: string) => {
    setAllRatings((prev) => prev.filter((r) => r.id !== id));
    try {
      await apiClient.deleteRating(id);
    } catch {
      refreshAll();
    }
  }, [refreshAll]);

  const saveStats = useCallback(async (patch: Partial<ApiSiteStats>) => {
    try {
      const updated = await apiClient.updateStats(patch);
      return updated;
    } catch (e) {
      throw e;
    }
  }, []);

  return {
    enquiries,
    consultations,
    allRatings,
    loading,
    refreshAll,
    setEnquiries,
    setConsultations,
    setAllRatings,
    toggleEnquiryAnswered,
    deleteEnquiry,
    toggleConsultationAnswered,
    deleteConsultation,
    toggleRatingApproval,
    deleteRating,
    saveStats,
  };
}

/* ------------------- useResourceDownload ------------------- */
export function useResourceDownload() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = useCallback(async (resourceId: string) => {
    setDownloadingId(resourceId);
    try {
      const updated = await apiClient.incrementResourceDownload(resourceId);
      return updated;
    } finally {
      setDownloadingId(null);
    }
  }, []);

  return { download, downloadingId };
}
