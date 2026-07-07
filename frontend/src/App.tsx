import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ServicesSection from './components/ServicesSection';
import RecordSection from './components/RecordSection';
import ResourceHubSection from './components/ResourceHubSection';
import RatingsSection from './components/RatingsSection';
import FAQsSection from './components/FAQsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

// Admin Components & Data Hooks
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { useAdminAuth, useSiteData } from './hooks/useApi';
import { apiClient } from './api/client';
import { SERVICES, RATINGS, INITIAL_TEAM_MEMBERS, INITIAL_ENQUIRIES, INITIAL_CONSULTATIONS, INITIAL_SITE_STATS, INITIAL_RATINGS } from './data/mockData';
import { Service, Enquiry, Consultation, Rating, PortfolioItem, TeamMember } from './types';
import TeamSection from './components/TeamSection';

/**
 * LOCAL PERSISTENCE LAYER
 * -----------------------
 * Survives page refresh, hard reload, branch re-sync, and re-deploys.
 * Without this, every time the backend is unreachable the in-memory state
 * resets to the mock seed — which wiped any admin edits the user had made.
 * Now admin edits (and the seeded mock data) persist in localStorage and
 * are rehydrated on the next page load.
 *
 * Versioned with a SCHEMA_KEY so future shape changes can invalidate the cache.
 */
const PERSIST_VERSION = 'v1';
const PERSIST_PREFIX = `oss:${PERSIST_VERSION}:`;

function loadPersisted<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PERSIST_PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    // Defensive: if stored value is an array, ensure it's non-empty before
    // trusting it (avoid restoring an accidental empty save).
    if (Array.isArray(parsed) && parsed.length === 0) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

function savePersisted<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PERSIST_PREFIX + key, JSON.stringify(value));
  } catch {
    // QuotaExceeded / private mode — silently ignore, in-memory state still works.
  }
}

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  // Shared state for portfolio checkout redirects
  const [preSelectedService, setPreSelectedService] = useState('');
  const [preSelectedPortfolio, setPreSelectedPortfolio] = useState('');

  // Authentication — backed by backend JWT with demo-mode fallback
  // (any username/password works when the FastAPI backend is unreachable).
  const { isAuthenticated: isAdminAuthenticated, login: doLogin, logout: doLogout, checking } = useAdminAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // ── LIVE BACKEND DATA ────────────────────────────────────────────────
  // useSiteData() fires on mount and fetches services, ratings, resources,
  // team members, stats, faqs, and contact platforms in parallel. The
  // localStorage-cached state below remains the source of truth for the
  // initial render (so the site is never blank during the first paint or
  // when the backend is unreachable), and gets overwritten as soon as the
  // backend returns real data.
  const site = useSiteData();

  // Centralized Lifted Operational Counters State
  const [stats, setStats] = useState(() => loadPersisted('stats', {
    clients: INITIAL_SITE_STATS.clients,
    orders: INITIAL_SITE_STATS.orders,
    countries: INITIAL_SITE_STATS.countries
  }));

  // Centralized Lifted Services List State
  const [services, setServices] = useState<Service[]>(() => loadPersisted('services', SERVICES));

  // Centralized Lifted Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => loadPersisted('teamMembers', INITIAL_TEAM_MEMBERS));

  // Centralized Lifted Client Reviews State (Seeded with isApproved: true)
  const [ratings, setRatings] = useState<Rating[]>(() => loadPersisted('ratings', INITIAL_RATINGS));

  // Centralized Enquiries State (Seeded with 2 professional entries)
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => loadPersisted('enquiries', INITIAL_ENQUIRIES));

  // Centralized Consultations State (Seeded with 2 initial bookings)
  const [consultations, setConsultations] = useState<Consultation[]>(() => loadPersisted('consultations', INITIAL_CONSULTATIONS));

  // ── SYNC BACKEND → LOCAL STATE ───────────────────────────────────────
  // Each block runs only when the backend actually returned non-empty
  // data for that key, so we never wipe the seeded fallback with an empty
  // array (which would happen on first load while the request is in flight).
  useEffect(() => {
    if (site.services && site.services.length > 0) setServices(site.services as unknown as Service[]);
  }, [site.services]);
  useEffect(() => {
    if (site.ratings && site.ratings.length > 0) setRatings(site.ratings as unknown as Rating[]);
  }, [site.ratings]);
  useEffect(() => {
    if (site.teamMembers && site.teamMembers.length > 0) setTeamMembers(site.teamMembers as unknown as TeamMember[]);
  }, [site.teamMembers]);
  useEffect(() => {
    if (site.stats && (site.stats.clients > 0 || site.stats.orders > 0 || site.stats.countries > 0)) {
      setStats(site.stats as any);
    }
  }, [site.stats]);

  // PERSISTENCE — mirror every state mutation back to localStorage so admin
  // edits (and the seeded mock data) survive page refresh, branch re-sync,
  // and re-deploys. This is what stops the public site from "going back" to
  // an empty state after a sync.
  useEffect(() => { savePersisted('services', services); }, [services]);
  useEffect(() => { savePersisted('teamMembers', teamMembers); }, [teamMembers]);
  useEffect(() => { savePersisted('ratings', ratings); }, [ratings]);
  useEffect(() => { savePersisted('enquiries', enquiries); }, [enquiries]);
  useEffect(() => { savePersisted('consultations', consultations); }, [consultations]);
  useEffect(() => { savePersisted('stats', stats); }, [stats]);

  // ------------------------------------------------------------------
  // CROSS-TAB REAL-TIME SYNC
  // ------------------------------------------------------------------
  // When the user has Admin open in one tab and the Public Site open in
  // another, edits made in admin are written to localStorage (above), but
  // the public site tab's React state doesn't know about them — so the
  // public site keeps showing stale data until the user manually refreshes.
  //
  // The browser fires a `storage` event in OTHER tabs/windows whenever
  // localStorage is modified. We listen for it here and re-hydrate the
  // affected slice of state. This is what makes admin edits show up on the
  // public site IN REAL TIME (no refresh, no logout needed).
  //
  // Same-tab updates (admin → logout → public site) already work because
  // the in-memory state is preserved across the unmount.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !e.key.startsWith(PERSIST_PREFIX)) return;
      const key = e.key.slice(PERSIST_PREFIX.length);
      if (e.newValue == null) return; // key was deleted — ignore
      try {
        const parsed = JSON.parse(e.newValue);
        switch (key) {
          case 'services':
            setServices(prev => {
              const next = Array.isArray(parsed) && parsed.length ? parsed : prev;
              return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
            });
            break;
          case 'teamMembers':
            setTeamMembers(prev => {
              const next = Array.isArray(parsed) && parsed.length ? parsed : prev;
              return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
            });
            break;
          case 'ratings':
            setRatings(prev => {
              const next = Array.isArray(parsed) && parsed.length ? parsed : prev;
              return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
            });
            break;
          case 'enquiries':
            setEnquiries(prev => {
              const next = Array.isArray(parsed) && parsed.length ? parsed : prev;
              return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
            });
            break;
          case 'consultations':
            setConsultations(prev => {
              const next = Array.isArray(parsed) && parsed.length ? parsed : prev;
              return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
            });
            break;
          case 'stats':
            setStats(prev => (JSON.stringify(prev) === JSON.stringify(parsed) ? prev : parsed));
            break;
          default:
            break;
        }
      } catch {
        // ignore malformed payloads — never let a bad sync crash the app
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Hash-based admin access — visiting #admin auto-opens the login modal.
  // Works in both unauthenticated and authenticated states (lets the user
  // jump straight back into the dashboard).
  useEffect(() => {
    const checkAdminHash = () => {
      if (window.location.hash.toLowerCase() === '#admin') {
        setIsLoginModalOpen(true);
      }
    };
    checkAdminHash();
    window.addEventListener('hashchange', checkAdminHash);
    return () => window.removeEventListener('hashchange', checkAdminHash);
  }, []);

  // ── VISIT TRACKING ───────────────────────────────────────────────────
  // Fire a single visit-tracking beacon on the public site mount. Skipped
  // when the user is in the admin dashboard (admin's own visits shouldn't
  // pollute the analytics). Best-effort: failures are swallowed inside
  // trackVisit() so a dead analytics endpoint never breaks the public site.
  useEffect(() => {
    if (isAdminAuthenticated) return;
    apiClient.trackVisit();
  }, [isAdminAuthenticated]);

  // Scroll spy to highlight active menu section
  useEffect(() => {
    // If authenticated in admin panel, disable scroll spy to prevent errors
    if (isAdminAuthenticated) return;

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      const scrollPosition = window.scrollY + 200; // Offset for sticky navbar

      const sections = [
        { id: 'hero', element: document.getElementById('hero') },
        { id: 'records', element: document.getElementById('records') },
        { id: 'services', element: document.getElementById('services') },
        { id: 'portfolio', element: document.getElementById('portfolio') },
        { id: 'ratings', element: document.getElementById('ratings') },
        { id: 'resources', element: document.getElementById('resources') },
        { id: 'team', element: document.getElementById('team') },
        { id: 'faqs', element: document.getElementById('faqs') },
        { id: 'contact', element: document.getElementById('contact') }
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = sections[i];
        if (sec.element) {
          const offsetTop = sec.element.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminAuthenticated]);

  const handleNavigate = (sectionId: string) => {
    const targetElement = document.getElementById(sectionId);
    if (targetElement) {
      // Offset scroll height to account for sticky navbar
      const yOffset = -80;
      const y = targetElement.getBoundingClientRect().top + window.scrollY + yOffset;

      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleOrderNow = (serviceName: string, portfolioTitle?: string) => {
    setPreSelectedService(serviceName);
    if (portfolioTitle) {
      setPreSelectedPortfolio(portfolioTitle);
    } else {
      setPreSelectedPortfolio('');
    }

    // Scroll smoothly to contact section
    handleNavigate('contact');
  };

  // While checking existing token, show nothing (avoid flashing public site → admin)
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-japandi-bg text-japandi-soot">
        <div className="text-sm opacity-60">Loading…</div>
      </div>
    );
  }

  // Switch layouts completely upon Authentication
  if (isAdminAuthenticated) {
    return (
      <AdminDashboard
        onLogout={doLogout}
        enquiries={enquiries}
        consultations={consultations}
        services={services}
        ratings={ratings}
        stats={stats}
        teamMembers={teamMembers}
        onUpdateEnquiries={setEnquiries}
        onUpdateConsultations={setConsultations}
        onUpdateServices={setServices}
        onUpdateRatings={setRatings}
        onUpdateStats={setStats}
        onUpdateTeamMembers={setTeamMembers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-japandi-bg text-japandi-soot antialiased flex flex-col justify-between selection:bg-japandi-earth/15 selection:text-japandi-earth">

      {/* Sticky Navbar with double-click hidden login hook */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onSelectService={setSelectedServiceId}
        onLogoDoubleClick={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">

        {/* 1. Hero Landing Page */}
        <Hero
          onExplore={() => handleNavigate('services')}
          onBook={() => handleNavigate('contact')}
        />

        {/* 2. Animated Proven Performance Counters (Using reactive stats) */}
        <RecordSection
          initialClients={stats.clients}
          initialOrders={stats.orders}
          initialCountries={stats.countries}
        />

        {/* 3. Services, Sub-options & Portfolio Galleries */}
        <ServicesSection
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          onOrderNow={handleOrderNow}
          servicesList={services}
        />

        {/* 5. Dynamic Filterable Client Reviews */}
        <RatingsSection ratingsList={ratings} servicesList={services} />

        {/* 6. Downloadable Resources Hub & search queries */}
        <ResourceHubSection />

        {/* 7. Team Members Grid & Corner Active Lights */}
        <TeamSection teamList={teamMembers} />

        {/* 8. Collapsible Common Accordion FAQs */}
        <FAQsSection />

        {/* 9. Contact Queries & Dual Timezone PKT Booking */}
        <ContactSection
          preSelectedService={preSelectedService}
          preSelectedPortfolio={preSelectedPortfolio}
          setPreSelectedService={setPreSelectedService}
          setPreSelectedPortfolio={setPreSelectedPortfolio}
          onAddEnquiry={(newEnq) => setEnquiries(prev => [newEnq, ...prev])}
          onAddConsultation={(newConsult) => setConsultations(prev => [newConsult, ...prev])}
        />

      </main>

      {/* Corporate footer block */}
      <Footer onNavigate={handleNavigate} />

      {/* Hidden Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={async (username: string, password: string) => {
          try {
            await doLogin(username, password);
            setIsLoginModalOpen(false);
            if (window.location.hash.toLowerCase() === '#admin') {
              history.replaceState(null, '', window.location.pathname + window.location.search);
            }
            return true;
          } catch (e) {
            return false;
          }
        }}
      />

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-40 p-3.5 bg-japandi-soot text-japandi-linen rounded-full shadow-md hover:bg-japandi-earth transition-colors border border-japandi-border hover:scale-105 cursor-pointer flex items-center justify-center"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating chatbot widget — only on the public site */}
      <ChatbotWidget />

    </div>
  );
}
