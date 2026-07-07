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

// Admin Components & API hooks
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { useSiteData, useAdminAuth } from './hooks/useApi';
import { apiClient } from './api/client';
import type { Service, Enquiry, Consultation, Rating, PortfolioItem, TeamMember } from './types';
import TeamSection from './components/TeamSection';

// Mock data — used as the initial seed AND as fallback when backend is unreachable.
// This restores the original "all-data-on-the-public-site" behavior from before
// the FastAPI backend was wired in.
import {
  SERVICES,
  INITIAL_RATINGS,
  INITIAL_TEAM_MEMBERS,
  INITIAL_ENQUIRIES,
  INITIAL_CONSULTATIONS,
  INITIAL_SITE_STATS,
} from './data/mockData';

// Premium UI global wrappers — public site only
import AuroraBackground from './components/ui/AuroraBackground';
import CustomCursor from './components/ui/CustomCursor';
import ScrollProgress from './components/ui/ScrollProgress';

/**
 * SHAPE-ADAPTERS — the existing components expect specific camelCase shapes
 * (e.g. `subServices`, `accentColor`, `imageAsset`). The API client already
 * returns these in the correct shape, but the components import `Service` type
 * from `types.ts` which has identical field names. The cast through `any`
 * below is safe because the API client shape matches the type definitions.
 */
function asServiceList(s: any[]): Service[] {
  return s as Service[];
}
function asRatingList(r: any[]): Rating[] {
  return r as Rating[];
}
function asTeamList(t: any[]): TeamMember[] {
  return t as TeamMember[];
}

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');

  // Shared state for portfolio checkout redirects
  const [preSelectedService, setPreSelectedService] = useState('');
  const [preSelectedPortfolio, setPreSelectedPortfolio] = useState('');

  // Authentication — backed by backend JWT
  const { isAuthenticated: isAdminAuthenticated, login: doLogin, logout: doLogout, checking } = useAdminAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // All public site data — fetched from backend (falls back to mock when empty)
  const {
    services: apiServices,
    ratings: apiRatings,
    resources: apiResources,
    teamMembers: apiTeamMembers,
    stats: apiStats,
    loading: siteLoading,
    refresh: refreshSite,
  } = useSiteData();

  // Centralized lifted state — seeded with mock data, then overwritten with
  // real API data ONLY when the backend actually returns something. This way
  // the public site shows full mock content even when the backend is down,
  // and admin edits persist in local state across login/logout cycles.
  const [services, setServices] = useState<Service[]>(() => SERVICES);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => INITIAL_TEAM_MEMBERS);
  const [ratings, setRatings] = useState<Rating[]>(() => INITIAL_RATINGS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => INITIAL_ENQUIRIES);
  const [consultations, setConsultations] = useState<Consultation[]>(() => INITIAL_CONSULTATIONS);
  const [stats, setStats] = useState(() => ({
    clients: INITIAL_SITE_STATS.clients,
    orders: INITIAL_SITE_STATS.orders,
    countries: INITIAL_SITE_STATS.countries,
    label: INITIAL_SITE_STATS.label,
  }));

  // Sync API data → local state, but ONLY when the API actually has data.
  // Empty arrays / zero stats from a dead backend must NOT wipe the mock seed.
  useEffect(() => {
    if (apiServices && apiServices.length > 0) setServices(asServiceList(apiServices));
  }, [apiServices]);
  useEffect(() => {
    if (apiTeamMembers && apiTeamMembers.length > 0) setTeamMembers(asTeamList(apiTeamMembers));
  }, [apiTeamMembers]);
  useEffect(() => {
    if (apiRatings && apiRatings.length > 0) setRatings(asRatingList(apiRatings));
  }, [apiRatings]);
  useEffect(() => {
    if (apiStats && (apiStats.clients > 0 || apiStats.orders > 0 || apiStats.countries > 0)) {
      setStats(apiStats);
    }
  }, [apiStats]);

  // Hash-based admin access — visiting #admin auto-opens the login modal
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

  // Scroll spy to highlight active menu section
  useEffect(() => {
    if (isAdminAuthenticated) return;
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      const scrollPosition = window.scrollY + 200;
      const sections = [
        { id: 'hero', element: document.getElementById('hero') },
        { id: 'records', element: document.getElementById('records') },
        { id: 'services', element: document.getElementById('services') },
        { id: 'portfolio', element: document.getElementById('portfolio') },
        { id: 'ratings', element: document.getElementById('ratings') },
        { id: 'resources', element: document.getElementById('resources') },
        { id: 'team', element: document.getElementById('team') },
        { id: 'faqs', element: document.getElementById('faqs') },
        { id: 'contact', element: document.getElementById('contact') },
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
      const yOffset = -80;
      const y = targetElement.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const handleOrderNow = (serviceName: string, portfolioTitle?: string) => {
    setPreSelectedService(serviceName);
    setPreSelectedPortfolio(portfolioTitle || '');
    handleNavigate('contact');
  };

  // Public submission handlers — POST directly to backend
  const handleAddEnquiry = async (newEnq: any) => {
    try {
      await apiClient.createEnquiry({
        name: newEnq.name,
        contactMethod: newEnq.contactMethod,
        contactInfo: newEnq.contactInfo,
        subject: newEnq.subject,
        message: newEnq.message,
        selectedService: newEnq.selectedService,
        timezone: newEnq.timezone,
      });
    } catch (e) {
      // Surface error to console — UI keeps optimistic add
      console.error('Failed to submit enquiry', e);
    }
  };

  const handleAddConsultation = async (newConsult: any) => {
    try {
      await apiClient.createConsultation({
        name: newConsult.name,
        email: newConsult.email,
        country: newConsult.country,
        selectedDateTime: newConsult.selectedDateTime,
        timezone: newConsult.timezone,
        pktTime: newConsult.pktTime,
      });
    } catch (e) {
      console.error('Failed to submit consultation', e);
    }
  };

  // Save site-wide stats (admin updates them through AdminDashboard)
  const handleUpdateStats = async (newStats: any) => {
    setStats(newStats);
    try {
      const updated = await apiClient.updateStats({
        clients: newStats.clients,
        orders: newStats.orders,
        countries: newStats.countries,
        label: newStats.label,
      });
      setStats(updated);
    } catch (e) {
      console.error('Failed to save stats', e);
    }
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
        // Pass the current public-site state so admin sees the same data
        // the public sees (mock seed OR live API data, whichever won).
        enquiries={enquiries}
        consultations={consultations}
        services={services}
        ratings={ratings}
        stats={stats}
        teamMembers={teamMembers}
        // Wire every update callback back to App.tsx state so admin edits
        // (add/edit/delete) persist on the public site after logout. The
        // AdminDashboard still tries the API internally; these callbacks
        // are the local-source-of-truth fallback.
        onUpdateEnquiries={setEnquiries}
        onUpdateConsultations={setConsultations}
        onUpdateServices={setServices}
        onUpdateRatings={setRatings}
        onUpdateStats={handleUpdateStats}
        onUpdateTeamMembers={setTeamMembers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-japandi-bg text-japandi-soot antialiased flex flex-col justify-between selection:bg-japandi-earth/15 selection:text-japandi-earth">

      {/* Premium global UI — public site only */}
      <AuroraBackground />
      <CustomCursor />
      <ScrollProgress />

      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onSelectService={setSelectedServiceId}
        onLogoDoubleClick={() => setIsLoginModalOpen(true)}
      />

      <main className="flex-grow">
        <Hero onExplore={() => handleNavigate('services')} onBook={() => handleNavigate('contact')} />

        <RecordSection
          initialClients={stats.clients}
          initialOrders={stats.orders}
          initialCountries={stats.countries}
        />

        <ServicesSection
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          onOrderNow={handleOrderNow}
          servicesList={services}
        />

        <RatingsSection ratingsList={ratings} />

        {/* ResourceHubSection currently imports RESOURCES internally; pass nothing extra */}
        <ResourceHubSection />

        <TeamSection teamList={teamMembers} />

        <FAQsSection />

        <ContactSection
          preSelectedService={preSelectedService}
          preSelectedPortfolio={preSelectedPortfolio}
          setPreSelectedService={setPreSelectedService}
          setPreSelectedPortfolio={setPreSelectedPortfolio}
          onAddEnquiry={handleAddEnquiry}
          onAddConsultation={handleAddConsultation}
        />
      </main>

      <Footer onNavigate={handleNavigate} />

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
    </div>
  );
}
