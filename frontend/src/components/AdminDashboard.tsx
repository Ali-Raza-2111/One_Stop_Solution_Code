import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Briefcase, 
  StarHalf, 
  BarChart3, 
  LogOut, 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Eye, 
  PlusCircle, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User,
  Shield,
  Star,
  Globe2,
  Sparkles,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Mail,
  Send,
  Calendar,
  Globe,
  MapPin,
  UserPlus,
  FolderPlus,
  ArrowLeft,
  Award,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Service, PortfolioItem, Enquiry, Consultation, Rating, TeamMember } from '../types';

interface AdminDashboardProps {
  services: Service[];
  ratings: Rating[];
  enquiries: Enquiry[];
  consultations: Consultation[];
  stats: { clients: number; orders: number; countries: number };
  onUpdateServices: (updated: Service[]) => void;
  onUpdateRatings: (updated: Rating[]) => void;
  onUpdateEnquiries: (updated: Enquiry[]) => void;
  onUpdateConsultations: (updated: Consultation[]) => void;
  onUpdateStats: (updated: { clients: number; orders: number; countries: number }) => void;
  onLogout: () => void;
  teamMembers: TeamMember[];
  onUpdateTeamMembers: (updated: TeamMember[]) => void;
}

type ActiveTab = 'analytics' | 'services' | 'reviews' | 'team' | 'contacts';

export default function AdminDashboard({
  services,
  ratings,
  enquiries,
  consultations,
  stats,
  onUpdateServices,
  onUpdateRatings,
  onUpdateEnquiries,
  onUpdateConsultations,
  onUpdateStats,
  onLogout,
  teamMembers,
  onUpdateTeamMembers
}: AdminDashboardProps) {
  // 1. Sidebar tab view state
  const [activeTab, setActiveTab] = useState<ActiveTab>('analytics');

  // ==========================================
  // VIEW A STATES & COMPARTMENTS (Analytics)
  // ==========================================
  const [countrySearch, setCountrySearch] = useState('');
  const [countryList, setCountryList] = useState([
    { name: 'United States', code: 'US', visits: 450 },
    { name: 'United Kingdom', code: 'GB', visits: 280 },
    { name: 'Canada', code: 'CA', visits: 190 },
    { name: 'Pakistan', code: 'PK', visits: 150 },
    { name: 'Germany', code: 'DE', visits: 95 },
    { name: 'United Arab Emirates', code: 'AE', visits: 80 },
    { name: 'Australia', code: 'AU', visits: 72 }
  ]);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryVisits, setNewCountryVisits] = useState('10');

  // Dynamic Conversion Pie Chart percentages
  const [conversionStats, setConversionStats] = useState({
    email: 42,
    whatsapp: 38,
    alternative: 20 // Fiverr, Upwork, LinkedIn
  });

  // Global reviews stats matrix (Editable, and automatically updates total/average)
  const [starsHistogram, setStarsHistogram] = useState({
    fiveStar: 120,
    fourStar: 24,
    threeStar: 7,
    twoStar: 2,
    oneStar: 1
  });

  // Calculate scores on the fly from starsHistogram
  const totalStars = 
    starsHistogram.fiveStar * 5 + 
    starsHistogram.fourStar * 4 + 
    starsHistogram.threeStar * 3 + 
    starsHistogram.twoStar * 2 + 
    starsHistogram.oneStar * 1;
  const totalReviewsCount = 
    starsHistogram.fiveStar + 
    starsHistogram.fourStar + 
    starsHistogram.threeStar + 
    starsHistogram.twoStar + 
    starsHistogram.oneStar;
  const computedAverageScore = totalReviewsCount > 0 ? (totalStars / totalReviewsCount).toFixed(2) : '0.00';

  // Domain specific score tracker (Editable)
  const [domainRatings, setDomainRatings] = useState([
    { domain: 'Bookkeeping & GAAP Audits', score: 4.95 },
    { domain: 'Catch-Up Cleanup Projects', score: 4.88 },
    { domain: 'Tax Preparation & Advisory', score: 4.91 },
    { domain: 'VBA & Spreadsheet Systems', score: 4.96 }
  ]);

  // ==========================================
  // VIEW B STATES & COMPARTMENTS (Services / Portfolio)
  // ==========================================
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || 'new');
  const [isCreatingNewService, setIsCreatingNewService] = useState(false);

  // New Service block initial structure
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Portfolio inline creation
  const [isAddingPortfolio, setIsAddingPortfolio] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portDesc, setPortDesc] = useState('');
  const [portSkillsInput, setPortSkillsInput] = useState('');
  const [portMediaUrl, setPortMediaUrl] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600');
  const [portMediaType, setPortMediaType] = useState<'image' | 'video' | 'pdf'>('image');

  // ==========================================
  // VIEW C STATES & COMPARTMENTS (Ratings Hub)
  // ==========================================
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    designation: '',
    company: '',
    comment: '',
    country: 'United States',
    ratingStars: 5,
    avatarUrl: ''
  });

  // Country Flag Code Map
  const flagMap: { [key: string]: string } = {
    'united states': '🇺🇸',
    'us': '🇺🇸',
    'united kingdom': '🇬🇧',
    'uk': '🇬🇧',
    'canada': '🇨🇦',
    'ca': '🇨🇦',
    'pakistan': '🇵🇰',
    'pk': '🇵🇰',
    'germany': '🇩🇪',
    'de': '🇩🇪',
    'australia': '🇦🇺',
    'au': '🇦🇺',
    'united arab emirates': '🇦🇪',
    'uae': '🇦🇪',
    'dubai': '🇦🇪',
    'saudi arabia': '🇸🇦',
    'sa': '🇸🇦'
  };

  const getCountryFlagEmoji = (countryName: string): string => {
    const norm = countryName.trim().toLowerCase();
    return flagMap[norm] || '🌐';
  };

  // ==========================================
  // VIEW D STATES & COMPARTMENTS (Team Board)
  // ==========================================
  const [isOnboardingEmployee, setIsOnboardingEmployee] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    role: '',
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    email: '',
    specialtiesInput: '',
    isOnline: true
  });
  const [tempCertValue, setTempCertValue] = useState<{ [key: string]: string }>({});

  // ==========================================
  // VIEW E STATES & COMPARTMENTS (Channels / Timezones)
  // ==========================================
  const [channels, setChannels] = useState([
    { name: 'Upwork Portfolio', type: 'Upwork', url: 'https://upwork.com/companies/~015a9999712a8069d2' },
    { name: 'Fiverr Professional Pro', type: 'Fiverr', url: 'https://fiverr.com/onestopservices' },
    { name: 'Corporate LinkedIn Profile', type: 'LinkedIn', url: 'https://linkedin.com/company/onestoponlineservices' },
    { name: 'WhatsApp Business Secure Line', type: 'WhatsApp', url: 'https://wa.me/923000000000' }
  ]);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState('LinkedIn');
  const [newChannelUrl, setNewChannelUrl] = useState('');

  const [consultationEmail, setConsultationEmail] = useState('bookings@onestoponlineservices.com');
  const [isEmailForwardingActive, setIsEmailForwardingActive] = useState(true);

  // Timezone Booking Conversion Simulator states
  const [simSelectedHour, setSimSelectedHour] = useState('14'); // 2 PM
  const [simSelectedMinute, setSimSelectedMinute] = useState('30'); // :30
  const [simClientTz, setSimClientTz] = useState('EST'); // UTC-5

  // Helper to calculate side-by-side PKT translation
  const getPKTEquivalent = () => {
    const hh = parseInt(simSelectedHour) || 0;
    const mm = parseInt(simSelectedMinute) || 0;
    
    // We simulate offsets relative to PKT (UTC+5)
    // EST is UTC-5 (offset = -10 hours compared to PKT)
    // GMT/UTC is UTC+0 (offset = -5 hours compared to PKT)
    // CET is UTC+1 (offset = -4 hours compared to PKT)
    // PST is UTC-8 (offset = -13 hours compared to PKT)
    let offsetFromPKT = -10; // default EST
    if (simClientTz === 'GMT') offsetFromPKT = -5;
    if (simClientTz === 'CET') offsetFromPKT = -4;
    if (simClientTz === 'PST') offsetFromPKT = -13;

    // Convert client time back to PKT: pkt_time = client_time - offsetFromPKT
    let pktHour = (hh - offsetFromPKT) % 24;
    if (pktHour < 0) pktHour += 24;

    const ampm = pktHour >= 12 ? 'PM' : 'AM';
    const displayHour = pktHour % 12 === 0 ? 12 : pktHour % 12;
    const padMin = mm.toString().padStart(2, '0');

    return `${displayHour}:${padMin} ${ampm} PKT (UTC+5)`;
  };

  // ==========================================
  // SHUFFLING & REARRANGING HANDLERS
  // ==========================================

  // Portfolio items reordering
  const handleMovePortfolioItem = (serviceId: string, itemIndex: number, direction: 'up' | 'down') => {
    const targetService = services.find(s => s.id === serviceId);
    if (!targetService || !targetService.portfolio) return;

    const portList = [...targetService.portfolio];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= portList.length) return;

    // Swap elements
    const temp = portList[itemIndex];
    portList[itemIndex] = portList[targetIndex];
    portList[targetIndex] = temp;

    // Update global state
    const updatedServices = services.map(s => s.id === serviceId ? { ...s, portfolio: portList } : s);
    onUpdateServices(updatedServices);
  };

  // Testimonials/Reviews reordering
  const handleMoveReview = (reviewIndex: number, direction: 'up' | 'down') => {
    const list = [...ratings];
    const targetIndex = direction === 'up' ? reviewIndex - 1 : reviewIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap elements
    const temp = list[reviewIndex];
    list[reviewIndex] = list[targetIndex];
    list[targetIndex] = temp;

    onUpdateRatings(list);
  };

  // Team Members reordering
  const handleMoveTeamMember = (memberIndex: number, direction: 'up' | 'down') => {
    const list = [...teamMembers];
    const targetIndex = direction === 'up' ? memberIndex - 1 : memberIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap elements
    const temp = list[memberIndex];
    list[memberIndex] = list[targetIndex];
    list[targetIndex] = temp;

    onUpdateTeamMembers(list);
  };

  // Add certification dynamic tag handler
  const handleAddCertTag = (memberId: string, certName: string) => {
    if (!certName.trim()) return;
    const updated = teamMembers.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          specialties: [...m.specialties, certName.trim()]
        };
      }
      return m;
    });
    onUpdateTeamMembers(updated);
    setTempCertValue(prev => ({ ...prev, [memberId]: '' }));
  };

  // Delete certification tag
  const handleDeleteCertTag = (memberId: string, indexToRemove: number) => {
    const updated = teamMembers.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          specialties: m.specialties.filter((_, i) => i !== indexToRemove)
        };
      }
      return m;
    });
    onUpdateTeamMembers(updated);
  };

  // Handle new service block submission
  const handleCreateNewServiceBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServiceDesc.trim()) return;

    const newBlock: Service = {
      id: `srv-${Date.now()}`,
      name: newServiceName,
      accentColor: '#4f46e5',
      textColor: '#ffffff',
      tailwindColor: 'indigo',
      shortDesc: newServiceDesc.slice(0, 100) + '...',
      overallDescription: newServiceDesc,
      iconName: 'Sparkles',
      subServices: [
        {
          id: `sub-${Date.now()}`,
          name: 'Core Support Session',
          accentColor: '#4f46e5',
          textColor: '#ffffff',
          tailwindColor: 'indigo',
          description: 'Specialist-led consultation.'
        }
      ],
      portfolio: []
    };

    onUpdateServices([...services, newBlock]);
    setSelectedServiceId(newBlock.id);
    setNewServiceName('');
    setNewServiceDesc('');
    setIsCreatingNewService(false);
  };

  // Handle inline portfolio item submission for selected service
  const handleAddPortfolioToService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portTitle.trim() || !portDesc.trim()) return;

    const newPort: PortfolioItem = {
      id: `port-${Date.now()}`,
      title: portTitle,
      description: portDesc,
      skills: portSkillsInput.split(',').map(s => s.trim()).filter(Boolean),
      mediaType: portMediaType,
      mediaTitle: portMediaType === 'pdf' ? 'Report_Deliverable.pdf' : 'Interactive Project Portfolio',
      mediaUrl: portMediaUrl,
      thumbnailUrl: portMediaUrl
    };

    const updated = services.map(s => {
      if (s.id === selectedServiceId) {
        return {
          ...s,
          portfolio: [...(s.portfolio || []), newPort]
        };
      }
      return s;
    });

    onUpdateServices(updated);
    setPortTitle('');
    setPortDesc('');
    setPortSkillsInput('');
    setIsAddingPortfolio(false);
  };

  // Handle review deletion
  const handleDeleteRating = (id: string) => {
    onUpdateRatings(ratings.filter(r => r.id !== id));
  };

  // Add country visits log
  const handleAddCountryVisits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim()) return;
    const countVal = parseInt(newCountryVisits) || 0;

    // Check if country already exists
    const existingIndex = countryList.findIndex(c => c.name.toLowerCase() === newCountryName.toLowerCase());
    if (existingIndex !== -1) {
      const copy = [...countryList];
      copy[existingIndex].visits += countVal;
      setCountryList(copy);
    } else {
      setCountryList([...countryList, {
        name: newCountryName,
        code: newCountryName.slice(0, 2).toUpperCase(),
        visits: countVal
      }]);
    }

    setNewCountryName('');
    setNewCountryVisits('10');
  };

  // SVG calculations for Conversion Pie Chart
  const getPieSlices = () => {
    const total = conversionStats.email + conversionStats.whatsapp + conversionStats.alternative;
    if (total === 0) return [];
    
    let cumulativeAngle = 0;
    const slices = [
      { key: 'Email', value: conversionStats.email, color: 'rgb(59, 130, 246)' },
      { key: 'WhatsApp', value: conversionStats.whatsapp, color: 'rgb(34, 197, 94)' },
      { key: 'Alternative', value: conversionStats.alternative, color: 'rgb(148, 163, 184)' }
    ];

    return slices.map(s => {
      const percentage = (s.value / total) * 100;
      const angle = (s.value / total) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;

      // Calculate path arc values for SVG sector
      const radStart = (startAngle - 90) * (Math.PI / 180);
      const radEnd = (cumulativeAngle - 90) * (Math.PI / 180);

      const r = 40; // radius
      const cx = 50; // center X
      const cy = 50; // center Y

      const x1 = cx + r * Math.cos(radStart);
      const y1 = cy + r * Math.sin(radStart);
      const x2 = cx + r * Math.cos(radEnd);
      const y2 = cy + r * Math.sin(radEnd);

      const largeArcFlag = angle > 180 ? 1 : 0;

      // Arc path
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return {
        ...s,
        percentage,
        pathData
      };
    });
  };

  const activeService = services.find(s => s.id === selectedServiceId) || services[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden font-sans">
      
      {/* Absolute radiant ambient lights meshes */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[130px] pointer-events-none" />

      {/* Persistence Left Glass Sidebar Layout */}
      <aside className="w-80 bg-slate-900/60 backdrop-blur-2xl border-r border-white/5 p-6 flex flex-col justify-between relative z-10 shrink-0">
        <div>
          {/* ← Exit Workspace anchor link at peak */}
          <button
            onClick={onLogout}
            className="w-full mb-8 px-4 py-3 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 flex items-center justify-center space-x-2.5 transition-all cursor-pointer active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>← Exit Workspace & View Live Site</span>
          </button>

          {/* Control center Branding panel */}
          <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-white/5">
            <div className="relative p-3 bg-indigo-600 rounded-2xl text-white shadow-xl">
              <Shield className="w-5 h-5 text-indigo-100" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border border-slate-950 rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white uppercase font-sans">
                OneStop Workstation
              </h2>
              <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-widest uppercase block mt-1">
                Admin Control Room
              </span>
            </div>
          </div>

          {/* Administrative Page View Toggle List */}
          <nav className="space-y-2">
            {[
              { id: 'analytics', label: 'Dashboard Analytics', icon: LayoutDashboard, color: 'text-indigo-400' },
              { id: 'services', label: 'Services & Portfolios', icon: Briefcase, color: 'text-sky-400' },
              { id: 'reviews', label: 'Client Feedback Hub', icon: StarHalf, color: 'text-amber-400' },
              { id: 'team', label: 'Team & Badges', icon: UserPlus, color: 'text-emerald-400' },
              { id: 'contacts', label: 'Contact Channels', icon: Globe2, color: 'text-rose-400' }
            ].map(tab => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`w-full px-4 py-3.5 rounded-2xl text-xs font-bold flex items-center space-x-3.5 transition-all duration-300 relative ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/15 to-indigo-500/5 text-white border-l-4 border-indigo-500 pl-3.5 shadow-md border border-white/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <IconComp className={`w-4.5 h-4.5 ${tab.color}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute right-3.5 w-1.5 h-1.5 rounded-full bg-indigo-400"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Panel and Logs Status */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="bg-slate-950/50 border border-white/5 p-3.5 rounded-2xl text-center">
            <div className="flex items-center justify-center space-x-1.5 text-[9px] font-mono font-bold text-slate-500 tracking-widest uppercase">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Admin Authentication Active</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full px-4 py-3.5 rounded-2xl text-xs font-black text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/35 flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Terminate Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport Workspace Container */}
      <main className="flex-1 overflow-y-auto p-10 relative z-10">
        
        {/* Main Workstation Header */}
        <header className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-md uppercase tracking-wider">
                Workspace Panel Active
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-xs text-slate-500 font-mono">UTC-5 Terminal synced</span>
            </div>
            <h1 className="text-3xl font-black text-white mt-2 tracking-tight">
              {activeTab === 'analytics' && 'Dashboard Analytics & System Overrides'}
              {activeTab === 'services' && 'Services & Dynamic Portfolio Workspace'}
              {activeTab === 'reviews' && 'Client Feedback Hub & Testimony Control'}
              {activeTab === 'team' && 'Team Badges & Corporate Employee Onboarding'}
              {activeTab === 'contacts' && 'Contact Channels & PKT Booking Translation'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              {activeTab === 'analytics' && 'Review client geographic coverage, live SVG conversion shares, and star metrics.'}
              {activeTab === 'services' && 'Inline text area editing of titles, dashboard catalogs, and Upwork portfolios rearrangement.'}
              {activeTab === 'reviews' && 'Moderate customer testimonials, flag overlays, and custom priority sorting.'}
              {activeTab === 'team' && 'Onboard specialists, shuffle grid priorities, and dynamically append certification badges.'}
              {activeTab === 'contacts' && 'Configure custom routing nodes, and simulate Pakistan Standard Time timezone translations.'}
            </p>
          </div>

          {/* Server Sync telemetry widget */}
          <div className="flex items-center space-x-3.5 bg-slate-900/60 px-5 py-3 rounded-2xl border border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-left font-mono">
              <div className="text-[10px] font-bold text-white leading-none">AUTO-ECHO ACTIVE</div>
              <div className="text-[9px] text-slate-500 mt-1 leading-none">Vite HMR Overruled</div>
            </div>
          </div>
        </header>

        {/* Compartment Swapping Zone */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            
            {/* ============================================================== */}
            {/* VIEW A: DASHBOARD ANALYTICS (Command Center)                   */}
            {/* ============================================================== */}
            {activeTab === 'analytics' && (
              <div className="space-y-8">
                
                {/* 1. Core counters summary matrix (Interactive) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { key: 'clients', label: 'Satisfied Global Clients', value: stats.clients, color: 'from-indigo-500 to-indigo-600', max: 500 },
                    { key: 'orders', label: 'Completed Deliverables', value: stats.orders, color: 'from-sky-500 to-sky-600', max: 1000 },
                    { key: 'countries', label: 'Nations Represented', value: stats.countries, color: 'from-emerald-500 to-emerald-600', max: 50 }
                  ].map(item => (
                    <div 
                      key={item.key}
                      className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-slate-600 font-bold tracking-widest uppercase">
                        Override Active
                      </div>
                      <p className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">{item.label}</p>
                      
                      {/* Counter values and adjustments */}
                      <div className="flex items-baseline justify-between mt-4">
                        <span className="text-4xl font-black text-white font-mono tracking-tight">
                          {item.value}+
                        </span>
                        
                        {/* Shifter actions to alter statistics on public landing page instantly */}
                        <div className="flex space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-white/5">
                          <button
                            onClick={() => onUpdateStats({ ...stats, [item.key]: Math.max(0, item.value - 1) })}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Decrement statistic"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onUpdateStats({ ...stats, [item.key]: item.value + 1 })}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Increment statistic"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Manual text input override */}
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-center space-x-2">
                        <span className="text-[10px] text-slate-500 font-mono">Manual override:</span>
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            onUpdateStats({ ...stats, [item.key]: val });
                          }}
                          className="w-16 bg-slate-950/80 border border-white/10 rounded-lg py-1 px-2 text-[10px] font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 text-center"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Side-By-Side: Country-wise visitor logs & SVG Pie Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Country-wise visitor board */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                            <Globe2 className="w-4.5 h-4.5 text-indigo-400" />
                            Country-Wise Client Visitor Board
                          </h3>
                          <p className="text-[11px] text-slate-400 mt-0.5">Simulated real-time remote telemetry logs.</p>
                        </div>
                        <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/10">
                          Total Logged: {countryList.reduce((acc, c) => acc + c.visits, 0)} visits
                        </span>
                      </div>

                      {/* Search Bar */}
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500/60 placeholder-slate-600"
                        />
                      </div>

                      {/* Country Data Grid Table */}
                      <div className="max-h-56 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/5 pr-1.5">
                        {countryList
                          .filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
                          .map((country, idx) => (
                            <div 
                              key={country.name}
                              className="flex items-center justify-between p-2.5 bg-slate-950/45 hover:bg-slate-950 border border-white/5 rounded-xl transition-all text-xs font-mono"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-base">{getCountryFlagEmoji(country.name)}</span>
                                <span className="text-white font-sans font-bold">{country.name}</span>
                                <span className="text-[10px] text-slate-500">({country.code})</span>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-indigo-400 font-bold">{country.visits} visits</span>
                                
                                {/* Micro adjustment buttons */}
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => {
                                      const copy = [...countryList];
                                      copy[idx].visits = Math.max(0, copy[idx].visits - 10);
                                      setCountryList(copy);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"
                                    title="Subtract 10 visits"
                                  >
                                    -10
                                  </button>
                                  <button
                                    onClick={() => {
                                      const copy = [...countryList];
                                      copy[idx].visits += 10;
                                      setCountryList(copy);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-white transition-colors"
                                    title="Add 10 visits"
                                  >
                                    +10
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Quick Onboard New Country Log */}
                    <form onSubmit={handleAddCountryVisits} className="mt-5 pt-4 border-t border-white/5 grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          required
                          placeholder="e.g. United Arab Emirates"
                          value={newCountryName}
                          onChange={(e) => setNewCountryName(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-white focus:outline-none focus:border-indigo-500/60 placeholder-slate-600"
                        />
                      </div>
                      <div className="flex space-x-1.5">
                        <input
                          type="number"
                          required
                          value={newCountryVisits}
                          onChange={(e) => setNewCountryVisits(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-2 py-2 text-xs text-center font-mono text-indigo-400 focus:outline-none focus:border-indigo-500/60"
                        />
                        <button
                          type="submit"
                          className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center"
                          title="Register country visits"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Client Conversion Metric: Premium SVG Pie Chart */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-4.5 h-4.5 text-indigo-400" />
                        Client Conversion Metric (The Conversion Pie Chart)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Strict mapping: <span className="text-blue-400 font-semibold">Solid Blue</span> for Email, <span className="text-green-400 font-semibold">Light Green</span> for WhatsApp, <span className="text-slate-400 font-semibold">Neutral Grey</span> for Alternative (Fiverr, Upwork, LinkedIn).
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-center">
                        {/* The interactive SVG Canvas Pie */}
                        <div className="flex justify-center relative">
                          <svg viewBox="0 0 100 100" className="w-40 h-40 transform -rotate-90">
                            {getPieSlices().map((slice, i) => (
                              <path
                                key={slice.key}
                                d={slice.pathData}
                                fill={slice.color}
                                className="transition-all duration-300 hover:opacity-90 cursor-help"
                                title={`${slice.key}: ${slice.percentage.toFixed(0)}%`}
                              />
                            ))}
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-full bg-slate-950 border border-white/5" />
                          </div>
                        </div>

                        {/* Interactive adjustment controllers */}
                        <div className="space-y-3 font-mono text-xs">
                          {[
                            { key: 'email', label: 'Email Channels', color: 'bg-blue-500', text: 'text-blue-400' },
                            { key: 'whatsapp', label: 'WhatsApp', color: 'bg-green-500', text: 'text-green-400' },
                            { key: 'alternative', label: 'Alternative platforms', color: 'bg-slate-400', text: 'text-slate-400' }
                          ].map(item => {
                            const val = conversionStats[item.key as 'email' | 'whatsapp' | 'alternative'];
                            return (
                              <div key={item.key} className="space-y-1">
                                <div className="flex justify-between items-center text-[10px]">
                                  <span className="flex items-center gap-1.5 font-sans font-bold text-slate-300">
                                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                                    {item.label}
                                  </span>
                                  <span className={`${item.text} font-bold font-mono`}>{val} leads</span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={val}
                                    onChange={(e) => {
                                      const numeric = parseInt(e.target.value) || 0;
                                      setConversionStats(prev => ({ ...prev, [item.key]: numeric }));
                                    }}
                                    className="w-full accent-indigo-500 cursor-ew-resize bg-slate-950 h-1 rounded"
                                  />
                                  <input
                                    type="number"
                                    value={val}
                                    onChange={(e) => {
                                      const numeric = parseInt(e.target.value) || 0;
                                      setConversionStats(prev => ({ ...prev, [item.key]: numeric }));
                                    }}
                                    className="w-10 bg-slate-950 border border-white/5 text-[9px] py-0.5 rounded text-center text-white"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 text-center text-[10px] text-slate-500 font-mono">
                      Real-Time SVG updates immediately render above.
                    </div>
                  </div>

                </div>

                {/* 3. Global Ratings Histogram (Editable Matrix) */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                        <Star className="w-4.5 h-4.5 text-amber-400" />
                        Global Ratings & Review Statistics Matrix
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Alter count levels to recalculate the weighted public score on the fly.
                      </p>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center font-mono">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Weighted Score</span>
                        <span className="text-2xl font-black text-amber-400 leading-none block mt-1">{computedAverageScore} / 5.0</span>
                      </div>
                      <div className="text-center font-mono border-l border-white/5 pl-6">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block">Testimonies Count</span>
                        <span className="text-2xl font-black text-white leading-none block mt-1">{totalReviewsCount} files</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      { key: 'fiveStar', stars: 5, color: 'bg-amber-400', label: 'Excellent (5★)' },
                      { key: 'fourStar', stars: 4, color: 'bg-amber-300', label: 'Satisfactory (4★)' },
                      { key: 'threeStar', stars: 3, color: 'bg-amber-200', label: 'Average (3★)' },
                      { key: 'twoStar', stars: 2, color: 'bg-orange-400', label: 'Mediocre (2★)' },
                      { key: 'oneStar', stars: 1, color: 'bg-rose-500', label: 'Deficient (1★)' }
                    ].map(tier => {
                      const value = starsHistogram[tier.key as keyof typeof starsHistogram];
                      const pct = totalReviewsCount > 0 ? (value / totalReviewsCount) * 100 : 0;
                      return (
                        <div key={tier.key} className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase block">{tier.label}</span>
                          
                          {/* Visual mini bar */}
                          <div className="w-full h-1.5 bg-slate-900 rounded-full my-3 overflow-hidden">
                            <div className={`h-full ${tier.color}`} style={{ width: `${pct}%` }} />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-mono">{pct.toFixed(0)}% share</span>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setStarsHistogram(prev => ({ ...prev, [tier.key]: Math.max(0, value - 1) }))}
                                className="p-0.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white rounded text-[10px] font-mono leading-none"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={value}
                                onChange={(e) => {
                                  const v = parseInt(e.target.value) || 0;
                                  setStarsHistogram(prev => ({ ...prev, [tier.key]: v }));
                                }}
                                className="w-10 bg-slate-900 border border-white/10 rounded text-[10px] text-center font-mono py-0.5 text-white focus:outline-none"
                              />
                              <button
                                onClick={() => setStarsHistogram(prev => ({ ...prev, [tier.key]: value + 1 }))}
                                className="p-0.5 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white rounded text-[10px] font-mono leading-none"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Service Specific Domain Ratings matrix */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                  <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2 mb-2">
                    <Award className="w-4.5 h-4.5 text-indigo-400" />
                    Service-Specific Domain Ratings Matrix
                  </h3>
                  <p className="text-[11px] text-slate-400 mb-6">
                    Customize isolated rating averages associated with discrete expertise categories.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {domainRatings.map((dom, idx) => (
                      <div key={dom.domain} className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 relative group">
                        <span className="text-[10px] text-indigo-400 font-bold font-mono tracking-wider block mb-1">DOMAIN VERTICAL</span>
                        <h4 className="text-xs font-sans font-bold text-white max-w-[180px] leading-tight min-h-[32px]">{dom.domain}</h4>
                        
                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                          <span className="text-xs font-mono font-black text-amber-400">★ {dom.score.toFixed(2)}</span>
                          
                          <div className="flex items-center space-x-1">
                            <input
                              type="range"
                              min="3"
                              max="5"
                              step="0.01"
                              value={dom.score}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 4.5;
                                const copy = [...domainRatings];
                                copy[idx].score = val;
                                setDomainRatings(copy);
                              }}
                              className="w-20 h-1 accent-indigo-500 cursor-ew-resize bg-slate-900 rounded"
                            />
                            <input
                              type="number"
                              step="0.01"
                              value={dom.score}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 4.5;
                                const copy = [...domainRatings];
                                copy[idx].score = val;
                                setDomainRatings(copy);
                              }}
                              className="w-11 bg-slate-900 border border-white/5 rounded text-[9px] text-center font-mono py-0.5 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW B: SERVICES & PORTFOLIOS WORKSPACE (Two-Column Builder)   */}
            {/* ============================================================== */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column: Stacked list of existing services & creation anchor */}
                <div className="space-y-4">
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                        Available Services List
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{services.length} categories</span>
                    </div>

                    {/* Dashed creation button at the peak of the stack */}
                    <button
                      onClick={() => {
                        setIsCreatingNewService(true);
                        setSelectedServiceId('new');
                      }}
                      className={`w-full py-4 mb-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                        isCreatingNewService
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400 hover:text-white'
                      }`}
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span className="text-xs font-bold font-sans">+ Create New Service Block</span>
                    </button>

                    {/* Vertically stacked list */}
                    <div className="space-y-2">
                      {services.map(s => {
                        const isSelected = selectedServiceId === s.id && !isCreatingNewService;
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSelectedServiceId(s.id);
                              setIsCreatingNewService(false);
                            }}
                            className={`w-full text-left p-3.5 rounded-2xl border text-xs flex flex-col justify-between transition-all ${
                              isSelected
                                ? 'bg-indigo-600/15 border-indigo-500/80 text-white shadow-md'
                                : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="font-bold text-slate-200 text-sm truncate">{s.name}</span>
                              <span className="text-[9px] font-mono bg-slate-950 px-2 py-0.5 rounded border border-white/5 text-slate-400 shrink-0">
                                {s.portfolio?.length || 0} portfolios
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 truncate w-full leading-normal">
                              {s.overallDescription || s.shortDesc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right columns (takes remaining 2 columns): Active editing zone */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {isCreatingNewService ? (
                    /* Creation UI form for a brand new service block */
                    <form onSubmit={handleCreateNewServiceBlock} className="bg-slate-900/40 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-4">
                      <div className="border-b border-white/5 pb-3.5 flex items-center justify-between">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-indigo-400" />
                          New Service Block Onboarding Profile
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingNewService(false);
                            setSelectedServiceId(services[0]?.id || 'new');
                          }}
                          className="text-xs font-mono font-bold text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 pl-1">
                          Service Offering Title
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Forensic GAAP Reconstruction"
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          className="w-full bg-slate-950/65 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500/80"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 pl-1">
                          Deep Service Description
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Explain what technologies, methodologies, and value this service offering delivers to global clients."
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          className="w-full bg-slate-950/65 border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-indigo-500/80 font-sans"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-extrabold rounded-2xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg active:scale-[0.98]"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Publish Service Catalog Block</span>
                      </button>
                    </form>
                  ) : activeService ? (
                    /* Editor UI for currently selected existing service catalog */
                    <div className="space-y-6">
                      
                      {/* Section 1: In-line editable Title and Description fields */}
                      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
                        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">
                          Catalog Settings Override
                        </span>

                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 pl-1">
                              Catalog Category Heading
                            </label>
                            <input
                              type="text"
                              value={activeService.name}
                              onChange={(e) => {
                                const updated = services.map(s => s.id === activeService.id ? { ...s, name: e.target.value } : s);
                                onUpdateServices(updated);
                              }}
                              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white font-sans font-bold focus:outline-none focus:border-indigo-500/80"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 pl-1">
                              Extended Overview Description
                            </label>
                            <textarea
                              rows={3}
                              value={activeService.overallDescription || activeService.shortDesc}
                              onChange={(e) => {
                                const updated = services.map(s => s.id === activeService.id ? { ...s, overallDescription: e.target.value, shortDesc: e.target.value.slice(0, 100) + '...' } : s);
                                onUpdateServices(updated);
                              }}
                              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl p-4 text-xs text-white font-sans leading-relaxed focus:outline-none focus:border-indigo-500/80"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Nested Portfolio Workspace (Upwork-Style Management Layer) */}
                      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                          <div>
                            <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                              <Briefcase className="w-4.5 h-4.5 text-sky-400" />
                              Nested Portfolio Workspace (Upwork-Style Case Studies)
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Manage visual deliverables attached to this service. Shuffling or deleting updates the public portfolio array instantly.
                            </p>
                          </div>

                          <button
                            onClick={() => setIsAddingPortfolio(!isAddingPortfolio)}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer active:scale-[0.97]"
                          >
                            {isAddingPortfolio ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            <span>{isAddingPortfolio ? 'Collapse Form' : 'New Project Card'}</span>
                          </button>
                        </div>

                        {/* Inline Expandable Portfolio Creation Form */}
                        {isAddingPortfolio && (
                          <motion.form 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            onSubmit={handleAddPortfolioToService}
                            className="bg-slate-950/60 border border-indigo-500/20 p-5 rounded-2xl space-y-4 overflow-hidden"
                          >
                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">
                              Onboard New Portfolio Deliverable Case
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Project Case Title</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g., 3-Year Bookkeeping Catch-up & GAAP Audit"
                                  value={portTitle}
                                  onChange={(e) => setPortTitle(e.target.value)}
                                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Skills Badges (Comma Separated)</label>
                                <input
                                  type="text"
                                  placeholder="QuickBooks Online, Audit, Cleanup"
                                  value={portSkillsInput}
                                  onChange={(e) => setPortSkillsInput(e.target.value)}
                                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Brief Description / Narrative</label>
                              <textarea
                                required
                                rows={2}
                                placeholder="State the business problem, historical mess parameters, and active resolutions achieved."
                                value={portDesc}
                                onChange={(e) => setPortDesc(e.target.value)}
                                className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Media Format Type</label>
                                <select
                                  value={portMediaType}
                                  onChange={(e) => setPortMediaType(e.target.value as any)}
                                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                                >
                                  <option value="image">Static High-Res Image (Mockup/Dashboard)</option>
                                  <option value="video">Interactive Video Walkthrough (Loom/MP4)</option>
                                  <option value="pdf">Document Audit PDF (Cert/Ledger Report)</option>
                                </select>
                              </div>

                              <div className="col-span-2 space-y-1.5">
                                <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Project Banner Asset / Media URL</label>
                                <input
                                  type="text"
                                  value={portMediaUrl}
                                  onChange={(e) => setPortMediaUrl(e.target.value)}
                                  className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                            >
                              Add Project Card to Grid Catalog
                            </button>
                          </motion.form>
                        )}

                        {/* List of Attached Portfolio Items with "Rearrange" Protocol and movement arrow anchors */}
                        <div className="space-y-3.5">
                          {(!activeService.portfolio || activeService.portfolio.length === 0) ? (
                            <div className="p-8 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl">
                              <p className="text-xs text-slate-500 font-mono">No active visual portfolio cards found attached to this category.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {activeService.portfolio.map((item, index) => (
                                <motion.div
                                  layout
                                  key={item.id}
                                  className="p-4 bg-slate-950/60 border border-white/5 hover:border-white/10 rounded-2xl flex items-start justify-between gap-4 transition-all"
                                >
                                  {/* Thumbnail & Info Block */}
                                  <div className="flex items-start space-x-4">
                                    <img
                                      src={item.thumbnailUrl || item.mediaUrl}
                                      alt={item.title}
                                      className="w-20 h-16 rounded-xl object-cover border border-white/5 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="space-y-1.5">
                                      <h4 className="text-xs font-bold text-white font-sans">{item.title}</h4>
                                      
                                      {/* Tags rows */}
                                      <div className="flex flex-wrap gap-1">
                                        {item.skills.map(sk => (
                                          <span key={sk} className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                                            {sk}
                                          </span>
                                        ))}
                                      </div>
                                      
                                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans max-w-md line-clamp-2">
                                        {item.description}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Shuffling Ordering Controls & Trash Action */}
                                  <div className="flex items-center space-x-3 shrink-0">
                                    
                                    {/* Grip visual handle */}
                                    <div className="p-1.5 text-slate-600 cursor-grab active:cursor-grabbing" title="Visual Rearrange Handle">
                                      <GripVertical className="w-4 h-4" />
                                    </div>

                                    {/* Action shift selectors */}
                                    <div className="flex flex-col space-y-1">
                                      <button
                                        disabled={index === 0}
                                        onClick={() => handleMovePortfolioItem(activeService.id, index, 'up')}
                                        className="p-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        title="Move Project Case Up"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        disabled={index === activeService.portfolio.length - 1}
                                        onClick={() => handleMovePortfolioItem(activeService.id, index, 'down')}
                                        className="p-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                        title="Move Project Case Down"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                      </button>
                                    </div>

                                    {/* Destructive deletion */}
                                    <button
                                      onClick={() => {
                                        const updated = services.map(s => {
                                          if (s.id === activeService.id) {
                                            return {
                                              ...s,
                                              portfolio: (s.portfolio || []).filter(p => p.id !== item.id)
                                            };
                                          }
                                          return s;
                                        });
                                        onUpdateServices(updated);
                                      }}
                                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl border border-rose-500/10 transition-colors cursor-pointer"
                                      title="Delete Project Card"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>

                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="p-10 text-center bg-slate-900/30 border border-slate-800 rounded-3xl">
                      <p className="text-slate-500 text-sm font-mono">Select a service block or onboard a new category.</p>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW C: CLIENT FEEDBACK REVIEW HUB (Ratings Moderation)        */}
            {/* ============================================================== */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                
                {/* Testimony Header Dashboard stats */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                      <StarHalf className="w-4.5 h-4.5 text-amber-400" />
                      Client Feedback Moderation Hub
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Directly change sequences or delete testimonies. Flag overlay automation parses country names to superimpose appropriate assets when no avatar matches.
                    </p>
                  </div>

                  <button
                    onClick={() => setReviewFormOpen(!reviewFormOpen)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/15"
                  >
                    {reviewFormOpen ? 'Hide Input Sheet' : 'Onboard New Review Entry'}
                  </button>
                </div>

                {/* Inline Creation Form */}
                {reviewFormOpen && (
                  <motion.form 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return;

                      const created: Rating = {
                        id: `rate-${Date.now()}`,
                        serviceId: 'bookkeeping',
                        name: reviewForm.name,
                        designation: reviewForm.designation || 'Client Leader',
                        company: reviewForm.company || 'Direct Agency',
                        comment: reviewForm.comment,
                        country: reviewForm.country,
                        ratingStars: reviewForm.ratingStars,
                        isApproved: true,
                        avatarUrl: reviewForm.avatarUrl || '' // Leave blank to trigger flag overlay fallback
                      };

                      onUpdateRatings([created, ...ratings]);
                      setReviewForm({
                        name: '',
                        designation: '',
                        company: '',
                        comment: '',
                        country: 'United States',
                        ratingStars: 5,
                        avatarUrl: ''
                      });
                      setReviewFormOpen(false);
                    }}
                    className="bg-slate-900/60 border border-indigo-500/20 p-6 rounded-3xl space-y-4"
                  >
                    <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest pl-1">
                      New Testimony Credentials Form
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Full Client Name</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Designation / Title</label>
                        <input
                          type="text"
                          placeholder="e.g. CFO / Founder"
                          value={reviewForm.designation}
                          onChange={(e) => setReviewForm({ ...reviewForm, designation: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Company / Platform</label>
                        <input
                          type="text"
                          placeholder="e.g. Upwork Enterprise"
                          value={reviewForm.company}
                          onChange={(e) => setReviewForm({ ...reviewForm, company: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Geographic Origin / Country</label>
                        <input
                          type="text"
                          placeholder="e.g. United States"
                          value={reviewForm.country}
                          onChange={(e) => setReviewForm({ ...reviewForm, country: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Rating Stars</label>
                        <select
                          value={reviewForm.ratingStars}
                          onChange={(e) => setReviewForm({ ...reviewForm, ratingStars: parseInt(e.target.value) || 5 })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="5">5 Stars (Excellent)</option>
                          <option value="4">4 Stars (Good)</option>
                          <option value="3">3 Stars (Average)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Profile Photo URL (Optional)</label>
                        <input
                          type="text"
                          placeholder="Leave blank to trigger automatic Flag overlay"
                          value={reviewForm.avatarUrl}
                          onChange={(e) => setReviewForm({ ...reviewForm, avatarUrl: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Written Testimonial Testimony</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Paste or write the client's actual comment feedback..."
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-3 text-xs text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Lock and Publish Testimony
                    </button>
                  </motion.form>
                )}

                {/* Testimony lists streaming with drag shuffling and flag overlay fallbacks */}
                <div className="space-y-3.5">
                  {ratings.map((rate, index) => {
                    const hasAvatar = !!rate.avatarUrl;
                    const flag = getCountryFlagEmoji(rate.country);
                    return (
                      <motion.div
                        layout
                        key={rate.id}
                        className="p-5 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl flex items-start justify-between gap-4 group"
                      >
                        <div className="flex items-start space-x-4">
                          
                          {/* Avatar Circle layer with automated flag asset fallback */}
                          <div className="relative shrink-0">
                            {hasAvatar ? (
                              <img
                                src={rate.avatarUrl}
                                alt={rate.name}
                                className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-xl select-none" title="Geographic Flag Overlay Fallback">
                                {flag}
                              </div>
                            )}

                            {/* Little badge showing flag even if avatar exists */}
                            {hasAvatar && (
                              <span className="absolute -bottom-1 -right-1 bg-slate-950 border border-white/5 rounded-md px-0.5 text-[10px]">
                                {flag}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200 text-sm leading-none">{rate.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({rate.country})</span>
                              <span className="text-amber-400 text-xs font-mono font-bold">{'★'.repeat(rate.ratingStars || 5)}</span>
                            </div>
                            <p className="text-[10px] text-slate-400">
                              {rate.designation} at <span className="text-slate-300 font-semibold">{rate.company}</span>
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-2xl mt-2.5">
                              "{rate.comment}"
                            </p>
                          </div>
                        </div>

                        {/* Operational controllers: sorting and deletion */}
                        <div className="flex items-center space-x-3 shrink-0 self-center">
                          
                          {/* Shifter navigation */}
                          <div className="flex space-x-1">
                            <button
                              disabled={index === 0}
                              onClick={() => handleMoveReview(index, 'up')}
                              className="p-1.5 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                              title="Move Testimonial Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={index === ratings.length - 1}
                              onClick={() => handleMoveReview(index, 'down')}
                              className="p-1.5 bg-slate-950/60 hover:bg-slate-950 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 transition-all cursor-pointer"
                              title="Move Testimonial Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Destructive Deletion */}
                          <button
                            onClick={() => handleDeleteRating(rate.id)}
                            className="p-2.5 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/10 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 rounded-xl transition-all cursor-pointer"
                            title="Instantly Delete testimony"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW D: TEAM & BADGES MANAGEMENT (Employee Board)             */}
            {/* ============================================================== */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                
                {/* Onboard sheet button layout */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                      <User className="w-4.5 h-4.5 text-emerald-400" />
                      Dynamic Corporate Employee Board
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage vetted remote specialists, append certifications, and change employee priorities instantly.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsOnboardingEmployee(!isOnboardingEmployee)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {isOnboardingEmployee ? 'Close Onboard Form' : '+ Onboard New Employee'}
                  </button>
                </div>

                {/* Onboard form panel */}
                {isOnboardingEmployee && (
                  <motion.form 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!employeeForm.name.trim() || !employeeForm.role.trim()) return;

                      const onboarded: TeamMember = {
                        id: `member-${Date.now()}`,
                        name: employeeForm.name,
                        role: employeeForm.role,
                        bio: employeeForm.bio || 'Vetted consultant delivering secure corporate solutions.',
                        avatarUrl: employeeForm.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
                        email: employeeForm.email || 'consult@onestop.com',
                        specialties: employeeForm.specialtiesInput.split(',').map(s => s.trim()).filter(Boolean),
                        isOnline: employeeForm.isOnline
                      };

                      onUpdateTeamMembers([...teamMembers, onboarded]);
                      setEmployeeForm({
                        name: '',
                        role: '',
                        bio: '',
                        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
                        email: '',
                        specialtiesInput: '',
                        isOnline: true
                      });
                      setIsOnboardingEmployee(false);
                    }}
                    className="bg-slate-900/60 border border-emerald-500/20 p-6 rounded-3xl space-y-4 overflow-hidden"
                  >
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                      Corporate Onboard Personnel Registry Form
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Victoria Thorne"
                          value={employeeForm.name}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Job Title</label>
                        <input
                          type="text"
                          required
                          placeholder="Lead Accountant & Tax Partner"
                          value={employeeForm.role}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Email Node Address</label>
                        <input
                          type="email"
                          required
                          placeholder="victoria@onestop.com"
                          value={employeeForm.email}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Professional Experience Bio</label>
                        <textarea
                          rows={2}
                          placeholder="Summary of qualifications and background experience..."
                          value={employeeForm.bio}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, bio: e.target.value })}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl p-3 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Initial Certifications (CSV)</label>
                          <input
                            type="text"
                            placeholder="CPA, CFA, QuickBooks"
                            value={employeeForm.specialtiesInput}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, specialtiesInput: e.target.value })}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-slate-400 uppercase pl-1">Profile Photo URL</label>
                          <input
                            type="text"
                            value={employeeForm.avatarUrl}
                            onChange={(e) => setEmployeeForm({ ...employeeForm, avatarUrl: e.target.value })}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Authenticate and Register Employee
                    </button>
                  </motion.form>
                )}

                {/* Team grid dashboard catalog */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {teamMembers.map((member, index) => (
                    <div 
                      key={member.id}
                      className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative flex flex-col justify-between"
                    >
                      <div>
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                className="w-16 h-16 rounded-2xl object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${member.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                            </div>
                            <div>
                              <h4 className="text-base font-black text-white tracking-tight">{member.name}</h4>
                              <p className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">{member.role}</p>
                              <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{member.email}</span>
                            </div>
                          </div>

                          {/* Shifter and deletes actions */}
                          <div className="flex items-center space-x-1.5">
                            <button
                              disabled={index === 0}
                              onClick={() => handleMoveTeamMember(index, 'up')}
                              className="p-1 bg-slate-950/80 hover:bg-slate-950 border border-white/5 text-slate-400 hover:text-white rounded disabled:opacity-30 cursor-pointer"
                              title="Shuffle Rank Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={index === teamMembers.length - 1}
                              onClick={() => handleMoveTeamMember(index, 'down')}
                              className="p-1 bg-slate-950/80 hover:bg-slate-950 border border-white/5 text-slate-400 hover:text-white rounded disabled:opacity-30 cursor-pointer"
                              title="Shuffle Rank Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                onUpdateTeamMembers(teamMembers.filter(m => m.id !== member.id));
                              }}
                              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/10 rounded-lg cursor-pointer"
                              title="Decommission Employee File"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Bio paragraph */}
                        <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2 min-h-[44px]">
                          {member.bio}
                        </p>
                      </div>

                      {/* Achievements & Badges Sub-Layer (Certifications & Credentials) */}
                      <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          Certifications & Credentials
                        </span>

                        {/* Tag list */}
                        <div className="flex flex-wrap gap-1.5">
                          {(!member.specialties || member.specialties.length === 0) ? (
                            <span className="text-[9px] text-slate-600 font-mono italic">No badges listed yet.</span>
                          ) : (
                            member.specialties.map((spec, sIdx) => (
                              <span 
                                key={spec}
                                className="text-[9px] font-bold font-mono uppercase bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/10 flex items-center gap-1 shrink-0"
                              >
                                <span>{spec}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCertTag(member.id, sIdx)}
                                  className="hover:text-rose-400 text-slate-500 transition-colors"
                                  title="Remove certificate"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          )}
                        </div>

                        {/* Badge dynamic input field */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Add certification (e.g. CPA, Hubspot) and press Enter"
                            value={tempCertValue[member.id] || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              setTempCertValue(prev => ({ ...prev, [member.id]: v }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCertTag(member.id, tempCertValue[member.id] || '');
                              }
                            }}
                            className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-indigo-500/60 placeholder-slate-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddCertTag(member.id, tempCertValue[member.id] || '')}
                            className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold font-sans transition-all cursor-pointer shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ============================================================== */}
            {/* VIEW E: CONTACT CHANNELS & TIMEZONES                          */}
            {/* ============================================================== */}
            {activeTab === 'contacts' && (
              <div className="space-y-8">
                
                {/* 1. Query Routing Management & Social Networks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Channels active roster */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2 mb-2">
                        <Globe className="w-4.5 h-4.5 text-indigo-400" />
                        Query Routing Management & Social Networks
                      </h3>
                      <p className="text-xs text-slate-400 mb-6">
                        Provide visitor portals with unencoded target links. These bind dynamically onto active footer and navbar hooks.
                      </p>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {channels.map((ch, idx) => (
                          <div 
                            key={ch.name}
                            className="flex items-center justify-between p-3 bg-slate-950/60 border border-white/5 rounded-xl text-xs font-mono"
                          >
                            <div>
                              <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-1.5 py-0.5 rounded uppercase font-bold mr-2.5">
                                {ch.type}
                              </span>
                              <span className="text-white font-sans font-bold">{ch.name}</span>
                              <p className="text-[10px] text-slate-500 mt-1 truncate max-w-xs">{ch.url}</p>
                            </div>

                            <button
                              onClick={() => setChannels(channels.filter((_, i) => i !== idx))}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition-colors cursor-pointer"
                              title="Delete route node"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* New Channel Onboard Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newChannelName.trim() || !newChannelUrl.trim()) return;
                        setChannels([...channels, {
                          name: newChannelName,
                          type: newChannelType,
                          url: newChannelUrl
                        }]);
                        setNewChannelName('');
                        setNewChannelUrl('');
                      }}
                      className="mt-6 pt-5 border-t border-white/5 space-y-3"
                    >
                      <h4 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">
                        Add New Freelance/Social Link Node
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="e.g. Fiverr Pro Account"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <select
                          value={newChannelType}
                          onChange={(e) => setNewChannelType(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                        >
                          <option value="LinkedIn">LinkedIn</option>
                          <option value="Upwork">Upwork</option>
                          <option value="Fiverr">Fiverr</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="GitHub">GitHub</option>
                        </select>
                        <input
                          type="text"
                          required
                          placeholder="https://fiverr.com/username"
                          value={newChannelUrl}
                          onChange={(e) => setNewChannelUrl(e.target.value)}
                          className="w-full bg-slate-950/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Register social route channel
                      </button>
                    </form>
                  </div>

                  {/* Booking Routing configurations */}
                  <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2 mb-2">
                        <Mail className="w-4.5 h-4.5 text-indigo-400" />
                        Consultation Routing Setup Panel
                      </h3>
                      <p className="text-xs text-slate-400 mb-6">
                        Set active routing nodes for automatic 15-min calendar alerts triggered by the public consultation scheduler.
                      </p>

                      <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest pl-1">
                            Primary Receiver Mailbox address
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="email"
                              value={consultationEmail}
                              onChange={(e) => setConsultationEmail(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => alert('Consultation routing updated successfully!')}
                              className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                            >
                              Sync
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div>
                            <span className="text-xs font-sans font-bold text-slate-200">Instant Email Forwarding</span>
                            <p className="text-[10px] text-slate-500 font-sans">Forwards double-timezone reservations to receiver.</p>
                          </div>
                          
                          {/* Toggle */}
                          <button
                            type="button"
                            onClick={() => setIsEmailForwardingActive(!isEmailForwardingActive)}
                            className={`w-12 h-6 rounded-full p-1 transition-all ${isEmailForwardingActive ? 'bg-emerald-500 flex justify-end' : 'bg-slate-800 flex justify-start'}`}
                          >
                            <span className="w-4 h-4 bg-white rounded-full block" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl mt-6">
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-white font-sans block">Operational Integration Guard</span>
                          <p className="text-[10px] text-indigo-200 leading-relaxed font-sans mt-1">
                            All incoming leads are logged into the terminal cache database automatically even if the forwarding toggle is deactivated.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. Dual-Timezone Verification Card (Simulator) */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                  <div className="border-b border-white/5 pb-4 mb-6">
                    <h3 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                      <Clock className="w-4.5 h-4.5 text-indigo-400" />
                      Dual-Timezone Verification Card (PKT Translator Simulator)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Translate client selected slots directly to Pakistan Standard Time (PKT / UTC+5) dynamically to verify scheduling alignment.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    
                    {/* Left: Input Selection simulator */}
                    <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Incoming Reservation Slot Parameters
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-mono">CLIENT TZ</label>
                          <select
                            value={simClientTz}
                            onChange={(e) => setSimClientTz(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                          >
                            <option value="EST">USA (EST / UTC-5)</option>
                            <option value="CET">Europe (CET / UTC+1)</option>
                            <option value="GMT">London (GMT / UTC+0)</option>
                            <option value="PST">West Coast (PST / UTC-8)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-mono">HOUR SLOT</label>
                          <select
                            value={simSelectedHour}
                            onChange={(e) => setSimSelectedHour(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                          >
                            <option value="09">09:00 AM</option>
                            <option value="11">11:00 AM</option>
                            <option value="13">01:00 PM</option>
                            <option value="14">02:00 PM</option>
                            <option value="16">04:00 PM</option>
                            <option value="19">07:00 PM</option>
                            <option value="21">09:00 PM</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-mono">MINUTES</label>
                          <select
                            value={simSelectedMinute}
                            onChange={(e) => setSimSelectedMinute(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white"
                          >
                            <option value="00">00 mins</option>
                            <option value="15">15 mins</option>
                            <option value="30">30 mins</option>
                            <option value="45">45 mins</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Right: Explicit side-by-side translation card display */}
                    <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                      <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-indigo-500/10 blur-xl" />
                      
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-indigo-400 tracking-wider">
                        <span>LIVE TRANSLATION CHIPS</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      </div>

                      {/* Display side-by-side cards */}
                      <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Client selection</span>
                          <span className="text-white font-mono font-bold text-sm mt-1.5 block">
                            {simSelectedHour}:{simSelectedMinute} ({simClientTz})
                          </span>
                        </div>
                        <div className="bg-indigo-950/60 p-3.5 rounded-2xl border border-indigo-500/20">
                          <span className="text-[9px] text-indigo-300 uppercase font-bold block">PKT Equivalent</span>
                          <span className="text-amber-400 font-mono font-black text-sm mt-1.5 block">
                            {getPKTEquivalent()}
                          </span>
                        </div>
                      </div>

                      <div className="text-center text-[10px] text-slate-500 mt-4 font-mono">
                        Double-timezone alignment validated.
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </main>

    </div>
  );
}
