import { useState, useEffect, useRef } from 'react';
import { SERVICES, servicesData, DetailedService, PortfolioItem as DetailedPortfolioItem } from '../data/mockData';
import { Service, PortfolioItem } from '../types';
import { 
  Calculator, 
  BookOpen, 
  FileSpreadsheet, 
  ShieldAlert, 
  UserCheck, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  ExternalLink,
  Code,
  CheckCircle2,
  Lock,
  Clock,
  Settings,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DocumentLightbox from './DocumentLightbox';

interface ServicesSectionProps {
  selectedServiceId: string;
  setSelectedServiceId: (id: string) => void;
  onOrderNow: (serviceName: string, portfolioTitle?: string) => void;
  servicesList?: Service[];
}

const CATCHUP_SERVICE: Service = {
  id: 'catchup',
  name: 'Catch-Up Bookkeeping',
  accentColor: '#0ea5e9',
  textColor: '#ffffff',
  tailwindColor: 'sky',
  shortDesc: 'Expert backlog cleanup to bring your historical books up to date.',
  overallDescription: 'Get your back-taxes and books up-to-date with complete ease. Our specialized catch-up bookkeeping services reconcile multi-year transaction backlogs, duplicate invoices, and un-categorized bank feeds. We organize historical data into complete, compliant balance sheets and profit & loss statements so you can file taxes confidently.',
  iconName: 'BookOpen',
  subServices: [
    {
      id: 'cu-1',
      name: 'Historical Reconciliation',
      accentColor: '#0ea5e9',
      textColor: '#ffffff',
      tailwindColor: 'sky',
      description: 'Meticulous bank statement and credit card feed matching across multiple fiscal periods.'
    },
    {
      id: 'cu-2',
      name: 'Back-Tax Audit Prep',
      accentColor: '#2563eb',
      textColor: '#ffffff',
      tailwindColor: 'blue',
      description: 'Organizing complex Shopify, Stripe, or bank statements for compliant tax filings.'
    }
  ],
  portfolio: [
    {
      id: 'p-cu-1',
      title: '3-Year QuickBooks Online Account Cleanup',
      skills: ['QuickBooks Online', 'Bank Feeds', 'Historical Reconciliation', 'Chart of Accounts'],
      description: 'Reconciled 36 months of un-categorized transactions, bank feeds, and duplicate accounts for a fast-growing Shopify seller, ensuring flawless back-tax filing.',
      mediaType: 'pdf',
      mediaUrl: '/assets/quickbooks_cleanup_case_study.pdf',
      mediaTitle: 'QBO_Cleanup_Case_Study.pdf',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400'
    }
  ]
};

const TAX_SERVICE: Service = {
  id: 'tax',
  name: 'Tax Services',
  accentColor: '#10b981',
  textColor: '#ffffff',
  tailwindColor: 'emerald',
  shortDesc: 'Year-round expert support to maximize tax savings and maintain compliance.',
  overallDescription: 'Professional, forward-looking tax solutions designed to minimize your liabilities and maximize deductions. Our certified advisors handle annual returns, state franchise filings, sales tax automation, and quarterly estimations with institutional precision.',
  iconName: 'Calculator',
  subServices: [
    {
      id: 'tx-1',
      name: 'Corporate Tax Preparation',
      accentColor: '#10b981',
      textColor: '#ffffff',
      tailwindColor: 'emerald',
      description: 'Complete federal and state tax preparation, ensuring optimized deductions and zero compliance errors.'
    },
    {
      id: 'tx-2',
      name: 'Strategic Tax Advisory',
      accentColor: '#059669',
      textColor: '#ffffff',
      tailwindColor: 'green',
      description: 'Year-round consultation to structure transactions, optimize credits, and defer liabilities.'
    }
  ],
  portfolio: [
    {
      id: 'p-tx-1',
      title: 'End-of-Year Corporate Financial Reporting & Tax Readiness',
      skills: ['Financial Statements', 'Balance Sheets', 'Tax Readiness', 'GAAP Compliance'],
      description: 'Successfully prepared comprehensive year-end balance sheets, income statements, and cash flow statements, resolving a $45k accounts discrepancy to prepare for corporate tax filing.',
      mediaType: 'pdf',
      mediaUrl: '/assets/sample_financial_report.pdf',
      mediaTitle: 'Corporate_Financial_Statements_2025.pdf',
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400'
    }
  ]
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function ServicesSection({
  selectedServiceId,
  setSelectedServiceId,
  onOrderNow,
  servicesList
}: ServicesSectionProps) {
  const getServiceById = (id: string): Service => {
    const resolvedId = (id === 'accounting' || id === 'bookkeeping-accounting') ? 'bookkeeping' : 
                       (id === 'catch-up-bookkeeping') ? 'catchup' :
                       (id === 'tax-services') ? 'tax' : id;

    // If servicesList is provided, search there first!
    if (servicesList) {
      const foundInList = servicesList.find(s => s.id === resolvedId);
      if (foundInList) return foundInList;
    }

    if (resolvedId === 'catchup' && !servicesList) {
      return CATCHUP_SERVICE;
    }
    if (resolvedId === 'tax' && !servicesList) {
      return TAX_SERVICE;
    }
    const found = (servicesList || SERVICES).find(s => s.id === resolvedId);
    if (found) {
      if (resolvedId === 'bookkeeping' && !servicesList) {
        return {
          ...found,
          id: 'bookkeeping',
          name: servicesData[0].heading,
          shortDesc: servicesData[0].summary
        };
      }
      return found;
    }
    
    // Fallback: bookkeeping
    const bk = (servicesList || SERVICES).find(s => s.id === 'bookkeeping') || (servicesList || SERVICES)[0];
    return {
      ...bk,
      id: 'bookkeeping',
      name: servicesList ? bk.name : servicesData[0].heading,
      shortDesc: servicesList ? bk.shortDesc : servicesData[0].summary
    };
  };

  const [activeService, setActiveService] = useState<Service | null>(() => {
    if (servicesList && servicesList.length > 0) {
      return servicesList[0];
    }
    const bk = SERVICES.find(s => s.id === 'bookkeeping') || SERVICES[0];
    return {
      ...bk,
      id: 'bookkeeping',
      name: servicesData[0].heading,
      shortDesc: servicesData[0].summary
    };
  });

  // Keep activeService in sync when servicesList changes in Admin Dashboard
  useEffect(() => {
    if (servicesList && activeService) {
      const currentId = activeService.id;
      const found = servicesList.find(s => s.id === currentId);
      if (found) {
        setActiveService(found);
      } else if (servicesList.length > 0) {
        setActiveService(servicesList[0]);
      }
    }
  }, [servicesList]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [hoveredServiceId, setHoveredServiceId] = useState<string | null>(null);
  const [isDetailActive, setIsDetailActive] = useState(false);
  const isFirstRender = useRef(true);

  const handleCloseDetail = () => {
    setIsDetailActive(false);
    setSelectedServiceId('');
  };

  const handleOrderAndClose = (serviceName: string, portfolioTitle?: string) => {
    setIsDetailActive(false);
    onOrderNow(serviceName, portfolioTitle);
  };

  useEffect(() => {
    if (!selectedServiceId) {
      return;
    }
    const service = getServiceById(selectedServiceId);
    setActiveService(service);
    setIsDetailActive(true);
  }, [selectedServiceId]);

  // Mobile active tab auto-scrolling
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!activeService) return;
    const activeTab = document.getElementById(`tab-${activeService.id}`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeService?.id]);

  // Lock document scroll when full-screen service details modal is open
  useEffect(() => {
    if (isDetailActive) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isDetailActive]);

  // Preload all service images on mount to ensure smooth, instantaneous hover transitions
  useEffect(() => {
    const imagesToPreload = [
      'https://xendoo.com/wp-content/uploads/2025/03/Accounting-Bookkeeping-Accordion.webp',
      'https://xendoo.com/wp-content/uploads/2025/03/Behind-in-your-Books.webp',
      'https://xendoo.com/wp-content/uploads/2025/03/Tax-Accordion.webp',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1521791136368-1a46827d0515?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'
    ];
    const refs: HTMLImageElement[] = [];
    imagesToPreload.forEach((src) => {
      const img = new Image();
      img.src = src;
      refs.push(img);
    });
    // Store in global window reference to prevent GC and ensure instantaneous image swap
    (window as any)._preloadedImages = refs;
  }, []);

  const selectService = (service: Service) => {
    setSelectedServiceId(service.id);
    setActiveService(service);
    setIsDetailActive(true);
    // Smooth scroll to services section top
    const target = document.getElementById('services');
    if (target) {
      const yOffset = -90; // room for sticky navbar
      const y = target.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleLocalSelect = (service: Service) => {
    setActiveService(service);
  };

  const openPortfolioDetail = (item: PortfolioItem) => {
    setSelectedPortfolio(item);
    setIsLightboxOpen(true);
  };

  // Helper to render brand-like mini visual or standard icon
  const renderBrandLogo = (serviceId: string, sizeClass = 'w-5 h-5') => {
    switch (serviceId) {
      case 'bookkeeping':
        return (
          <div className="flex items-center space-x-1.5 shrink-0">
            {/* QuickBooks Logo */}
            <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-[#2CA01C]" xmlns="http://www.w3.org/2000/svg" title="QuickBooks">
              <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm.642 4.1335c.9554 0 1.7296.776 1.7296 1.7332v9.0667h1.6c1.614 0 2.9275-1.3156 2.9275-2.933 0-1.6173-1.3136-2.9333-2.9276-2.9333h-.6654V7.3334h.6654c2.5722 0 4.6577 2.0897 4.6577 4.667 0 2.5774-2.0855 4.6666-4.6577 4.6666H12.642zM7.9837 7.333h3.3291v12.533c-.9555 0-1.73-.7759-1.73-1.7332V9.0662H7.9837c-1.6146 0-2.9277 1.316-2.9277 2.9334 0 1.6175 1.3131 2.9333 2.9277 2.9333h.6654v1.7332h-.6654c-2.5725 0-4.6577-2.0892-4.6577-4.6665 0-2.5771 2.0852-4.6666 4.6577-4.6666Z"/>
            </svg>
            {/* Excel Logo */}
            <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-[#107C41]" xmlns="http://www.w3.org/2000/svg" title="Microsoft Excel">
              <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-2.38-3.87 2.34-3.8H7.46l-1.3 2.4-.05.08-.04.09-.64-1.28-.66-1.29H2.59l2.27 3.82-2.48 3.85h2.16zM14.25 21v-3H7.5v3zm0-4.5v-3.75H12v3.75zm0-5.25V7.5H12v3.75zm0-5.25V3H7.5v3zm8.25 15v-3h-6.75v3zm0-4.5v-3.75h-6.75v3.75zm0-5.25V7.5h-6.75v3.75zm0-5.25V3h-6.75v3Z"/>
            </svg>
          </div>
        );
      case 'msoffice':
        return (
          <div className="flex items-center space-x-1 shrink-0">
            {/* Word Logo */}
            <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-[#185ABD]" xmlns="http://www.w3.org/2000/svg" title="Microsoft Word">
              <path d="M23.004 1.5q.41 0 .703.293t.293.703v19.008q0 .41-.293.703t-.703.293H6.996q-.41 0-.703-.293T6 21.504V18H.996q-.41 0-.703-.293T0 17.004V6.996q0-.41.293-.703T.996 6H6V2.496q0-.41.293-.703t.703-.293zM6.035 11.203l1.442 4.735h1.64l1.57-7.876H9.036l-.937 4.653-1.325-4.5H5.38l-1.406 4.523-.938-4.675H1.312l1.57 7.874h1.641zM22.5 21v-3h-15v3zm0-4.5v-3.75H12v3.75zm0-5.25V7.5H12v3.75zm0-5.25V3h-15v3Z"/>
            </svg>
            {/* Excel Logo */}
            <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-[#107C41]" xmlns="http://www.w3.org/2000/svg" title="Microsoft Excel">
              <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-2.38-3.87 2.34-3.8H7.46l-1.3 2.4-.05.08-.04.09-.64-1.28-.66-1.29H2.59l2.27 3.82-2.48 3.85h2.16zM14.25 21v-3H7.5v3zm0-4.5v-3.75H12v3.75zm0-5.25V7.5H12v3.75zm0-5.25V3H7.5v3zm8.25 15v-3h-6.75v3zm0-4.5v-3.75h-6.75v3.75zm0-5.25V7.5h-6.75v3.75zm0-5.25V3h-6.75v3Z"/>
            </svg>
            {/* PowerPoint Logo */}
            <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 fill-[#C43E1C]" xmlns="http://www.w3.org/2000/svg" title="Microsoft PowerPoint">
              <path d="M13.5 1.5q1.453 0 2.795.375 1.342.375 2.508 1.06 1.166.686 2.12 1.641.956.955 1.641 2.121.686 1.166 1.061 2.508Q24 10.547 24 12q0 1.453-.375 2.795-.375 1.342-1.06 2.508-.686 1.166-1.641 2.12-.955.956-2.121 1.641-1.166.686-2.508 1.061-1.342.375-2.795.375-1.29 0-2.52-.305-1.23-.304-2.337-.884-1.108-.58-2.063-1.418-.955-.838-1.693-1.893H.997q-.411 0-.704-.293T0 17.004V6.996q0-.41.293-.703T.996 6h3.89q.739-1.055 1.694-1.893.955-.837 2.063-1.418 1.107-.58 2.337-.884Q12.21 1.5 13.5 1.5zm.75 1.535v8.215h8.215q-.14-1.64-.826-3.076-.686-1.436-1.782-2.531-1.095-1.096-2.537-1.782-1.441-.685-3.07-.826zm-5.262 7.57q0-.68-.228-1.166-.229-.486-.627-.79-.399-.305-.938-.446-.539-.14-1.172-.14H2.848v7.863h1.84v-2.742H5.93q.574 0 1.119-.17t.978-.493q.434-.322.698-.802.263-.48.263-1.114zM13.5 21q1.172 0 2.262-.287t2.056-.82q.967-.534 1.776-1.278.808-.744 1.418-1.664.61-.92.984-1.986.375-1.067.469-2.227h-9.703V3.035q-1.735.14-3.27.908T6.797 6h4.207q.41 0 .703.293t.293.703v10.008q0 .41-.293.703t-.703.293H6.797q.644.715 1.412 1.271.768.557 1.623.944.855.387 1.781.586Q12.54 21 13.5 21zM5.812 9.598q.575 0 .915.228.34.229.34.838 0 .27-.124.44-.123.17-.31.275-.188.105-.422.146-.234.041-.445.041H4.687V9.598Z"/>
            </svg>
          </div>
        );
      case 'accounting':
        return <Calculator className={`${sizeClass} text-indigo-600`} />;
      case 'internalaudit':
        return <ShieldAlert className={`${sizeClass} text-slate-700`} />;
      case 'virtualassistant':
        return <UserCheck className={`${sizeClass} text-purple-600`} />;
      case 'pdfs':
        return <FileText className={`${sizeClass} text-rose-600`} />;
      case 'yourservices':
        return (
          <div className="flex items-center space-x-1 font-mono text-[9px] font-bold shrink-0">
            <span className="bg-sky-500 text-white px-1 py-0.5 rounded text-[7px]">HTML</span>
            <span className="bg-indigo-500 text-white px-1 py-0.5 rounded text-[7px]">CSS</span>
            <span className="bg-indigo-600 text-white px-1 py-0.5 rounded text-[7px]">JS</span>
          </div>
        );
      default:
        return <Sparkles className={`${sizeClass} text-slate-500`} />;
    }
  };

  // Helper to map Lucide icon string to component
  const getLucideIcon = (name: string, color: string) => {
    const props = { className: 'w-5 h-5', style: { color } };
    switch (name) {
      case 'Calculator': return <Calculator {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'FileSpreadsheet': return <FileSpreadsheet {...props} />;
      case 'ShieldAlert': return <ShieldAlert {...props} />;
      case 'UserCheck': return <UserCheck {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'Code': return <Code {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  const displayServicesList = servicesList
    ? servicesList.map(s => ({
        id: s.id,
        name: s.name,
        shortDesc: s.shortDesc,
        accentColor: s.accentColor
      }))
    : [
        {
          id: 'bookkeeping',
          name: servicesData[0].heading,
          shortDesc: servicesData[0].summary,
          accentColor: '#4f46e5'
        },
        {
          id: 'catchup',
          name: servicesData[1].heading,
          shortDesc: servicesData[1].summary,
          accentColor: '#0ea5e9'
        },
        {
          id: 'tax',
          name: servicesData[2].heading,
          shortDesc: servicesData[2].summary,
          accentColor: '#10b981'
        },
        ...SERVICES.filter(s => s.id !== 'bookkeeping' && s.id !== 'accounting').map(s => ({
          id: s.id,
          name: s.name,
          shortDesc: s.shortDesc,
          accentColor: s.accentColor
        }))
      ];

  const visibleServices = displayServicesList;

  const getImageForService = (id: string): string => {
    // If servicesList is provided, search there first!
    if (servicesList) {
      const foundInList = servicesList.find(s => s.id === id);
      if (foundInList && foundInList.imageAsset) {
        return foundInList.imageAsset;
      }
    }
    const found = SERVICES.find(s => s.id === id);
    if (found && found.imageAsset) {
      return found.imageAsset;
    }

    switch (id) {
      case 'bookkeeping':
      case 'accounting':
      case 'bookkeeping-accounting':
        return servicesData[0].imageAsset;
      case 'catchup':
      case 'catch-up-bookkeeping':
        return servicesData[1].imageAsset;
      case 'tax':
      case 'tax-services':
        return servicesData[2].imageAsset;
      case 'msoffice':
        return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=800';
      case 'pdfs':
        return 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800';
      case 'internalaudit':
        return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800';
      case 'virtualassistant':
        return 'https://images.unsplash.com/photo-1521791136368-1a46827d0515?auto=format&fit=crop&q=80&w=800';
      default:
        return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800';
    }
  };

  const mapToDetailedService = (service: Service): DetailedService => {
    const found = servicesData.find(s => 
      s.id === service.id || 
      (service.id === 'bookkeeping' && s.id === 'bookkeeping-accounting') ||
      (service.id === 'catchup' && s.id === 'catch-up-bookkeeping') ||
      (service.id === 'tax' && s.id === 'tax-services')
    );
    if (found) return found;

    return {
      id: service.id,
      heading: service.name,
      summary: service.overallDescription || service.shortDesc,
      imageAsset: getImageForService(service.id),
      extendedDetails: service.subServices?.map(sub => `${sub.name}: ${sub.description}`) || [
        "Weekly operations tracking & custom delivery matrices",
        "Executive administrative workflow support with 100% confidentiality",
        "Comprehensive report compilation and regular briefing checks"
      ],
      portfolio: service.portfolio ? service.portfolio.map(p => ({
        title: p.title,
        description: p.description,
        skills: p.skills,
        mediaUrl: p.mediaUrl
      })) : []
    };
  };

  const renderImageShowcase = () => {
    const displayedServiceId = hoveredServiceId || (activeService ? activeService.id : 'bookkeeping');
    const displayedService = getServiceById(displayedServiceId);

    return (
      <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] lg:aspect-auto lg:h-full bg-white/40 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-white/50 shadow-xl transition-all duration-300 flex flex-col justify-stretch">
        <div className="relative w-full h-full overflow-hidden rounded-2xl bg-slate-50 border border-slate-200/50 flex-1">
          <AnimatePresence initial={false}>
            <motion.img
              key={displayedServiceId}
              src={getImageForService(displayedServiceId)}
              alt={displayedService.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <section id="services" className="py-24 bg-transparent border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest mb-2">Service Catalog</p>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-slate-900 mb-4">
            Professional Virtual Support Solutions
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed font-sans">
            Choose from our highly specialized, certified remote capabilities. Select any service class below to inspect real case studies, custom parameters, and deliverable reports.
          </p>
        </div>

        {/* Main interactive services catalog is always visible and beautiful */}
        <div className="space-y-16">
          {/* Mobile View Layout (below lg breakpoint) */}
          <div className="block lg:hidden space-y-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Our Primary Service Capabilities
            </h3>

            {/* Horizontal swipeable tab bar */}
            <div className="relative">
              <div 
                id="mobile-tabs-container"
                className="flex overflow-x-auto scrollbar-hide flex-nowrap gap-3 pb-3 -mx-6 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {displayServicesList.map((item) => {
                  const isSelected = activeService?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`tab-${item.id}`}
                      onClick={() => handleLocalSelect(getServiceById(item.id))}
                      className={`relative px-5 py-3 rounded-2xl font-sans font-bold text-sm shrink-0 transition-all duration-300 border cursor-pointer select-none ${
                        isSelected
                          ? "bg-white border-slate-200 text-indigo-600 shadow-sm font-extrabold animate-none"
                          : "bg-white/30 border-white/40 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Image Showcase (Right Below Tabs) */}
            <div className="w-full">
              {renderImageShowcase()}
            </div>

            {activeService && (
              <>
                {/* Mobile Service Summary Panel */}
                <div className="bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white/60 space-y-2">
                  <h4 className="font-sans font-extrabold text-base text-slate-800">
                    {activeService.name}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {activeService.shortDesc}
                  </p>
                </div>

                {/* Mobile View Details Button */}
                <div className="pt-2">
                  <button
                    onClick={() => setIsDetailActive(true)}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View {activeService.name} Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Desktop Layout (lg and above) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-stretch">
            
            {/* Left Column (Interactive Navigation - 6 Cols) */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 pl-1">
                Our Primary Service Capabilities
              </h3>
              
              <div className="flex flex-col space-y-2.5">
                {visibleServices.map((item) => {
                  const isSelected = activeService?.id === item.id;
                  const isHovered = hoveredServiceId === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      onClick={() => {
                        if (activeService?.id === item.id) {
                          setIsDetailActive(true);
                        } else {
                          handleLocalSelect(getServiceById(item.id));
                        }
                      }}
                      onMouseEnter={() => setHoveredServiceId(item.id)}
                      onMouseLeave={() => setHoveredServiceId(null)}
                      whileHover={{ scale: 1.01 }}
                      className={`relative px-5 py-3 rounded-2xl cursor-pointer group select-none transition-all duration-300 border flex items-center justify-between ${
                        isSelected 
                          ? 'border-white/60 shadow-md bg-white/10' 
                          : isHovered
                            ? 'border-white/30 bg-white/20 shadow-xs'
                            : 'border-transparent hover:bg-white/15'
                      }`}
                    >
                      {/* Sliding Frosted Glass Backdrop */}
                      {isSelected && (
                        <motion.div
                          layoutId="activeGlow"
                          className="absolute inset-0 bg-white/45 backdrop-blur-[12px] border border-white/60 rounded-2xl shadow-sm shadow-slate-200/30 -z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      <div className="flex items-center space-x-3.5 relative z-10">
                        {/* Mini logo / icon */}
                        <div className="p-2 bg-white/85 rounded-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                          {renderBrandLogo(item.id, 'w-4.5 h-4.5')}
                        </div>
                        
                        <h4 className="font-sans font-bold text-base text-slate-800 leading-tight">
                          {item.name}
                        </h4>
                      </div>

                      {/* Right Chevron / Arrow indicator */}
                      <div 
                        className="relative z-10 text-slate-400 group-hover:text-slate-800 transition-colors flex items-center gap-1.5"
                      >
                        <span className="text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">Learn More</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" style={{ color: isSelected ? item.accentColor : undefined }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (Visual Showcase - 6 Cols) */}
            <div className="lg:col-span-6 lg:sticky lg:top-24 flex flex-col justify-center lg:h-[520px]">
              <div className="lg:h-[480px]">
                {renderImageShowcase()}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Immersive Full-Screen Detailed Service Modal Overlay */}
      <AnimatePresence>
        {isDetailActive && activeService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-0 sm:p-6 md:p-10"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-5xl h-full max-h-[100vh] sm:max-h-[90vh] bg-[#FAF9F6] rounded-none sm:rounded-3xl shadow-2xl border-none sm:border sm:border-slate-200/50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sticky Top Header inside the modal for ease of use */}
              <div className="sticky top-0 z-30 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-slate-200/50 px-6 sm:px-8 py-4 flex items-center justify-between">
                <button
                  onClick={handleCloseDetail}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/70 hover:bg-white border border-slate-200/60 hover:border-indigo-500 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-slate-700 hover:text-indigo-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Services Catalog</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-bold uppercase">
                  <span>Viewing service details</span>
                </div>
                <button
                  onClick={handleCloseDetail}
                  className="p-2 hover:bg-slate-200/50 rounded-full transition-colors duration-200 cursor-pointer text-slate-500 hover:text-slate-800"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 sm:p-10 space-y-12">
                {/* Detailed Header Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Text and stats Column (7 Cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-3">
                      <span 
                        className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider inline-block shadow-xs"
                      >
                        {activeService.id.replace(/-/g, ' ')}
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-slate-900">
                        {mapToDetailedService(activeService).heading}
                      </h3>
                    </div>

                    <p className="text-base text-slate-700 leading-relaxed font-sans font-medium">
                      {mapToDetailedService(activeService).summary}
                    </p>

                    {/* Checklist of deliverables */}
                    <div className="space-y-4 pt-4 border-t border-slate-200/50">
                      <h4 className="text-[11px] font-bold font-mono uppercase tracking-wider text-indigo-600">
                        Key Deliverables & Core Features
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {mapToDetailedService(activeService).extendedDetails.map((detail, index) => (
                          <div 
                            key={index} 
                            className="p-4 bg-white/45 backdrop-blur-xs border border-white/50 rounded-2xl shadow-xs flex items-start gap-3 hover:shadow-sm hover:bg-white/60 transition-all duration-300"
                          >
                            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-700 leading-relaxed font-sans font-semibold">
                                {detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Column (5 Cols) */}
                  <div className="lg:col-span-5">
                    <div className="bg-white/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                          <Settings className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Service Key Metrics</span>
                        </h4>
                        <ul className="space-y-4">
                          <li className="flex items-center justify-between text-xs pb-2 border-b border-white/20">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Lock className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-sans">Confidential NDA option:</span>
                            </div>
                            <span className="font-mono font-bold text-slate-800 text-right">Available for all tasks</span>
                          </li>
                          <li className="flex items-center justify-between text-xs pb-2 border-b border-white/20">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-sans">Standard Delivery Time:</span>
                            </div>
                            <span className="font-mono font-bold text-slate-800 text-right">3 to 7 business days</span>
                          </li>
                          <li className="flex items-center justify-between text-xs pb-2 border-b border-white/20">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-sans">Reporting Frequency:</span>
                            </div>
                            <span className="font-mono font-bold text-slate-800 text-right">Weekly Progress Meetings</span>
                          </li>
                          <li className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Code className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-sans">Platforms Supported:</span>
                            </div>
                            <span className="font-mono font-bold text-slate-800 text-right">Excel, QBO, Xero, Acrobat</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-6 border-t border-white/40 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => handleOrderAndClose(mapToDetailedService(activeService).heading)}
                          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all text-center cursor-pointer duration-350 shadow-md shadow-indigo-600/10"
                        >
                          Order {mapToDetailedService(activeService).heading} Pack
                        </motion.button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Service Hero Image Block */}
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[21/9] border border-white/50 bg-slate-100 shadow-md group">
                  <img
                    src={mapToDetailedService(activeService).imageAsset}
                    alt={mapToDetailedService(activeService).heading}
                    className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-500 animate-none"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent p-4 sm:p-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">Premium Asset</span>
                      <h4 className="text-lg sm:text-2xl font-sans font-extrabold text-white tracking-tight">
                        {mapToDetailedService(activeService).heading} Overview
                      </h4>
                    </div>
                    <button
                      onClick={() => handleOrderAndClose(mapToDetailedService(activeService).heading)}
                      className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer shrink-0"
                    >
                      <span>Secure Booking Consultation</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Nested Case Portfolio Section */}
                <div className="border-t border-slate-200/50 pt-10">
                  <div className="mb-8">
                    <h4 className="text-[10px] font-bold font-mono uppercase tracking-wider text-indigo-600 mb-1">
                      Verified Project Work & Case Deliverables
                    </h4>
                    <p className="text-xs text-slate-500 font-sans">
                      Select any work sample below to inspect interactive sample reports, sheets, and documents directly in our live viewer.
                    </p>
                  </div>

                  {mapToDetailedService(activeService).portfolio && mapToDetailedService(activeService).portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {mapToDetailedService(activeService).portfolio.map((item, idx) => {
                        const richItem = {
                          id: `p-detail-${idx}`,
                          title: item.title,
                          description: item.description,
                          skills: item.skills,
                          mediaType: 'image' as const,
                          mediaUrl: item.mediaUrl,
                          thumbnailUrl: item.mediaUrl,
                          mediaTitle: `${item.title.replace(/\s+/g, '_')}.png`
                        };

                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ y: -3 }}
                            className="border border-white/40 rounded-2xl bg-white/35 overflow-hidden hover:shadow-lg transition-all duration-500 flex flex-col justify-between group backdrop-blur-md"
                          >
                            <div
                              onClick={() => openPortfolioDetail(richItem)}
                              className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer"
                            >
                              <img
                                src={richItem.thumbnailUrl}
                                alt={richItem.title}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-mono text-xs font-bold backdrop-blur-xs">
                                <span>Click to Open Inline Viewer ↗</span>
                              </div>
                              <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[9px] font-mono uppercase font-bold">
                                Image View
                              </div>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between">
                              <div>
                                <h5
                                  onClick={() => openPortfolioDetail(richItem)}
                                  className="font-sans font-bold text-base text-slate-800 mb-2 cursor-pointer group-hover:text-indigo-600 transition-colors duration-500"
                                >
                                  {richItem.title}
                                </h5>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                                  {richItem.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                  {richItem.skills.map((skill, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="px-2 py-0.5 bg-white/45 text-[9px] font-bold font-mono text-slate-500 uppercase rounded-md border border-white/45 shadow-sm"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-4 border-t border-white/40 flex items-center gap-3">
                                <button
                                  onClick={() => openPortfolioDetail(richItem)}
                                  className="flex-1 py-2 border border-white/50 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 rounded-xl text-xs font-semibold transition-all duration-300 text-center flex items-center justify-center space-x-1 cursor-pointer bg-white/20 hover:bg-white/40"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>View Deliverable</span>
                                </button>
                                <motion.button
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleOrderAndClose(mapToDetailedService(activeService).heading, richItem.title)}
                                  className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 rounded-xl text-xs font-bold transition-all duration-300 text-center cursor-pointer shadow-sm"
                                >
                                  Order This Now
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/25 rounded-2xl border border-dashed border-white/45 backdrop-blur-md">
                      <p className="text-sm text-slate-500">No portfolio cases uploaded for this section yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Document Lightbox */}
      <AnimatePresence>
        {selectedPortfolio && isLightboxOpen && (
          <DocumentLightbox
            isOpen={isLightboxOpen}
            onClose={() => {
              setIsLightboxOpen(false);
              setSelectedPortfolio(null);
            }}
            mediaType={selectedPortfolio.mediaType}
            mediaUrl={selectedPortfolio.mediaUrl}
            mediaTitle={selectedPortfolio.mediaTitle || `${selectedPortfolio.title.replace(/\s+/g, '_')}.${selectedPortfolio.mediaType === 'pdf' ? 'pdf' : 'jpg'}`}
            skills={selectedPortfolio.skills}
            description={selectedPortfolio.description}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
