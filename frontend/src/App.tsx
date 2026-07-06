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

// Admin Components & Data Hooks
import AdminDashboard from './components/AdminDashboard';
import AdminLoginModal from './components/AdminLoginModal';
import { SERVICES, RATINGS } from './data/mockData';
import { Service, Enquiry, Consultation, Rating, PortfolioItem, TeamMember } from './types';
import TeamSection, { INITIAL_TEAM_MEMBERS } from './components/TeamSection';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  
  // Shared state for portfolio checkout redirects
  const [preSelectedService, setPreSelectedService] = useState('');
  const [preSelectedPortfolio, setPreSelectedPortfolio] = useState('');

  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Centralized Lifted Operational Counters State
  const [stats, setStats] = useState({
    clients: 140,
    orders: 380,
    countries: 18
  });

  // Centralized Lifted Services List State
  const [services, setServices] = useState<Service[]>(() => SERVICES);

  // Centralized Lifted Team Members State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => INITIAL_TEAM_MEMBERS);

  // Centralized Lifted Client Reviews State (Seeded with isApproved: true)
  const [ratings, setRatings] = useState<Rating[]>(() => 
    RATINGS.map(r => ({ ...r, isApproved: true }))
  );

  // Centralized Enquiries State (Seeded with 2 professional entries)
  const [enquiries, setEnquiries] = useState<Enquiry[]>([
    {
      id: 'q-1',
      name: 'James C.',
      contactMethod: 'email',
      contactInfo: 'james@lumina.io',
      subject: 'Custom Excel Macro Automation',
      message: 'Hello, we are looking to integrate dynamic Shopify dashboards with an offline Excel workbook. Can we schedule a quick call to talk details?',
      selectedService: 'MS Office Automation',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
      isAnswered: false,
      timezone: 'United States (EST)'
    },
    {
      id: 'q-2',
      name: 'Amina Shah',
      contactMethod: 'whatsapp',
      contactInfo: '+923009876543',
      subject: 'Historical Catch-Up',
      message: 'Hello, we have 2 years of bookkeeping backlog. Need cleanup urgently for our upcoming audit.',
      selectedService: 'Catch-Up Bookkeeping',
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      isAnswered: true,
      timezone: 'Pakistan (PKT)'
    }
  ]);

  // Centralized Consultations State (Seeded with 2 initial bookings)
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: 'c-1',
      name: 'Marcus K.',
      email: 'm.keller@apex.com',
      country: 'Germany',
      selectedDateTime: 'Jul 15, 2026, 3:30 PM (CEST)',
      timezone: 'Europe/Berlin',
      pktTime: '15-Jul-2026 6:30 PM (PKT)',
      isAnswered: false,
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      id: 'c-2',
      name: 'Saira Malik',
      email: 'saira@creativeagencies.com',
      country: 'Pakistan',
      selectedDateTime: 'Jul 18, 2026, 11:00 AM (PKT)',
      timezone: 'Asia/Karachi',
      pktTime: '18-Jul-2026 11:00 AM (PKT)',
      isAnswered: true,
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
    }
  ]);

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

  // Switch layouts completely upon Authentication
  if (isAdminAuthenticated) {
    return (
      <AdminDashboard
        onLogout={() => setIsAdminAuthenticated(false)}
        enquiries={enquiries}
        onUpdateEnquiries={setEnquiries}
        consultations={consultations}
        onUpdateConsultations={setConsultations}
        services={services}
        onUpdateServices={setServices}
        ratings={ratings}
        onUpdateRatings={setRatings}
        stats={stats}
        onUpdateStats={setStats}
        teamMembers={teamMembers}
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
        <RatingsSection ratingsList={ratings} />

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
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
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

    </div>
  );
}
