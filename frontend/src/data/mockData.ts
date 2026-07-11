import { Service, ResourceItem, Enquiry, Consultation, Rating, TeamMember } from '../types';

export interface DetailedPortfolioItem {
  title: string;
  description: string;
  skills: string[];
  mediaUrl: string;
}

export type PortfolioItem = DetailedPortfolioItem;


export interface DetailedService {
  id: string;
  heading: string;
  summary: string;
  imageAsset: string;
  extendedDetails: string[];
  portfolio?: DetailedPortfolioItem[];
}

export const servicesData: DetailedService[] = [
  {
    id: "bookkeeping-accounting",
    heading: "Bookkeeping & Accounting",
    summary: "Your numbers are always up-to-date. With weekly bookkeeping, your accountant ensures accurate financials and timely monthly reports.",
    imageAsset: "https://xendoo.com/wp-content/uploads/2025/03/Accounting-Bookkeeping-Accordion.webp",
    extendedDetails: [
      "Weekly transaction categorization & multi-bank ledger reconciliation",
      "Monthly Profit & Loss, Balance Sheet, and Statement of Cash Flows generation",
      "Seamless software sync with QuickBooks Online, Xero, and corporate bank feeds"
    ],
    portfolio: [
      {
        title: "E-Commerce Financial Reconstruction",
        description: "Reconciled 6 months of messy, high-volume Stripe and Shopify payouts with QuickBooks Online.",
        skills: ["QuickBooks Online", "Shopify", "Data Reconciliation"],
        mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "catch-up-bookkeeping",
    heading: "Catch-Up Bookkeeping",
    summary: "Behind on your books? We’ve got you covered. Your books will be updated accurately, bringing financial clarity and confidence.",
    imageAsset: "https://xendoo.com/wp-content/uploads/2025/03/Behind-in-your-Books.webp",
    extendedDetails: [
      "Forensic look-back through historical unorganized accounts and missing receipts",
      "Historical cleanup and bank statement matching going back up to 3 fiscal years",
      "Clean books preparation for audits, lines of credit, or corporate tax filings"
    ],
    portfolio: [
      {
        title: "3-Year Clean-up for Venture-Backed Startup",
        description: "Sorted out over $500k in historical untracked SaaS expenses and closed books for clean audits.",
        skills: ["Excel Data Analysis", "Ledger Cleanup", "Audit Preparation"],
        mediaUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800"
      }
    ]
  },
  {
    id: "tax-services",
    heading: "Tax Services",
    summary: "Year-round tax support from expert advisors, dedicated to maximizing your tax savings and keeping your business compliant.",
    imageAsset: "https://xendoo.com/wp-content/uploads/2025/03/Tax-Accordion.webp",
    extendedDetails: [
      "Strategic corporate and individual tax planning, advisory, and structure setups",
      "Maximizing localized deductions and discovering niche industry tax credits",
      "Prompt, compliant federal & state tax returns with zero-error guarantees"
    ],
    portfolio: [
      {
        title: "Small Business Corporate Tax Minimization",
        description: "Restructured asset depreciation profiles, legally reducing year-end tax liability by 15%.",
        skills: ["Corporate Tax Strategy", "Compliance", "Tax Deductions"],
        mediaUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
      }
    ]
  }
];

export const SERVICES: Service[] = [
  {
    id: "bookkeeping",
    name: "Bookkeeping & Accounting",
    accentColor: "#6366f1",
    textColor: "#ffffff",
    tailwindColor: "indigo",
    shortDesc: "Your numbers are always up-to-date and tax-compliant.",
    overallDescription: "Ensure seamless compliance, error-free monthly ledgers, and accurate tax-ready reporting. Our certified remote specialists handle day-to-day accounts management with state-of-the-art tools.",
    iconName: "BookOpen",
    subServices: [
      {
        id: "bk-1",
        name: "Weekly Ledgers Maintenance",
        accentColor: "#6366f1",
        textColor: "#ffffff",
        tailwindColor: "indigo",
        description: "Regular transaction categorization and multi-account ledger upkeep."
      },
      {
        id: "bk-2",
        name: "Monthly Financial Reporting",
        accentColor: "#4f46e5",
        textColor: "#ffffff",
        tailwindColor: "indigo",
        description: "Comprehensive Profit & Loss reports, balance sheets, and cash flow statements."
      }
    ],
    portfolio: [
      {
        id: "p-bk-1",
        title: "E-Commerce Financial Reconstruction",
        skills: ["QuickBooks Online", "Shopify", "Data Reconciliation"],
        description: "Reconciled 6 months of messy, high-volume Stripe and Shopify payouts with QuickBooks Online.",
        mediaType: "pdf",
        mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        mediaTitle: "Ecommerce_Reconciliation_Report.pdf",
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
      }
    ]
  },
  {
    id: "catchup",
    name: "Catch-Up Bookkeeping",
    accentColor: "#0ea5e9",
    textColor: "#ffffff",
    tailwindColor: "sky",
    shortDesc: "Expert backlog cleanup to bring your historical books up to date.",
    overallDescription: "Get your back-taxes and books up-to-date with complete ease. Our specialized catch-up bookkeeping services reconcile multi-year transaction backlogs, duplicate invoices, and un-categorized bank feeds. We organize historical data into complete, compliant balance sheets and profit & loss statements so you can file taxes confidently.",
    iconName: "BookOpen",
    subServices: [
      {
        id: "cu-1",
        name: "Historical Reconciliation",
        accentColor: "#0ea5e9",
        textColor: "#ffffff",
        tailwindColor: "sky",
        description: "Meticulous bank statement and credit card feed matching across multiple fiscal periods."
      },
      {
        id: "cu-2",
        name: "Back-Tax Audit Prep",
        accentColor: "#2563eb",
        textColor: "#ffffff",
        tailwindColor: "blue",
        description: "Organizing complex Shopify, Stripe, or bank statements for compliant tax filings."
      }
    ],
    portfolio: [
      {
        id: "p-cu-1",
        title: "3-Year QuickBooks Online Account Cleanup",
        skills: ["QuickBooks Online", "Bank Feeds", "Historical Reconciliation", "Chart of Accounts"],
        description: "Reconciled 36 months of un-categorized transactions, bank feeds, and duplicate accounts for a fast-growing Shopify seller, ensuring flawless back-tax filing.",
        mediaType: "pdf",
        mediaUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
        mediaTitle: "QBO_Cleanup_Case_Study.pdf",
        thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"
      }
    ]
  },
  {
    id: "tax",
    name: "Tax Services",
    accentColor: "#10b981",
    textColor: "#ffffff",
    tailwindColor: "emerald",
    shortDesc: "Year-round expert support to maximize tax savings and maintain compliance.",
    overallDescription: "Professional, forward-looking tax solutions designed to minimize your liabilities and maximize deductions. Our certified advisors handle annual returns, state franchise filings, sales tax automation, and quarterly estimations with institutional precision.",
    iconName: "Calculator",
    subServices: [
      {
        id: "tx-1",
        name: "Corporate Tax Preparation",
        accentColor: "#10b981",
        textColor: "#ffffff",
        tailwindColor: "emerald",
        description: "Complete federal and state tax preparation, ensuring optimized deductions and zero compliance errors."
      },
      {
        id: "tx-2",
        name: "Strategic Tax Advisory",
        accentColor: "#059669",
        textColor: "#ffffff",
        tailwindColor: "green",
        description: "Year-round consultation to structure transactions, optimize credits, and defer liabilities."
      }
    ],
    portfolio: [
      {
        id: "p-tx-1",
        title: "End-of-Year Corporate Financial Reporting & Tax Readiness",
        skills: ["Financial Statements", "Balance Sheets", "Tax Readiness", "GAAP Compliance"],
        description: "Successfully prepared comprehensive year-end balance sheets, income statements, and cash flow statements, resolving a $45k accounts discrepancy to prepare for corporate tax filing.",
        mediaType: "pdf",
        mediaUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
        mediaTitle: "Corporate_Financial_Statements_2025.pdf",
        thumbnailUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400"
      }
    ]
  },
  {
    id: "msoffice",
    name: "MS Office Automation",
    accentColor: "#2563eb",
    textColor: "#ffffff",
    tailwindColor: "blue",
    shortDesc: "Advanced Excel models, custom macros, and corporate presentations.",
    overallDescription: "Supercharge your business operations. We build complex, highly automated spreadsheet templates, customized VBA/macro workflows, robust financial projection sheets, and high-converting pitch decks.",
    iconName: "FileSpreadsheet",
    subServices: [
      {
        id: "ms-1",
        name: "Advanced Excel Modeling",
        accentColor: "#2563eb",
        textColor: "#ffffff",
        tailwindColor: "blue",
        description: "Dynamic financial forecasting, dynamic dash components, and automated dashboards."
      },
      {
        id: "ms-2",
        name: "PowerPoint Pitch Decks",
        accentColor: "#1d4ed8",
        textColor: "#ffffff",
        tailwindColor: "blue",
        description: "Stunning presentation designs tailored to institutional investment rounds."
      }
    ],
    portfolio: [
      {
        id: "p-ms-1",
        title: "Real Estate Investment Underwriting Model",
        skills: ["Financial Modeling", "VBA Macros", "Excel Automation"],
        description: "Created a fully-automated, multi-scenario underwriting spreadsheet for evaluating multi-family real estate acquisitions.",
        mediaType: "excel",
        mediaUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
        mediaTitle: "RE_Acquisitions_Underwriting_v2.4.xlsx",
        thumbnailUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400"
      }
    ]
  },
  {
    id: "internalaudit",
    name: "Internal Audit",
    accentColor: "#4b5563",
    textColor: "#ffffff",
    tailwindColor: "slate",
    shortDesc: "Operational risk matrices, policy reviews, and fraud safeguards.",
    overallDescription: "Secure your operational foundations. Our risk assessment experts audit company accounts, highlight balance discrepancies, and establish internal control matrices to safeguard corporate assets.",
    iconName: "ShieldAlert",
    subServices: [
      {
        id: "ia-1",
        name: "Internal Control Design",
        accentColor: "#4b5563",
        textColor: "#ffffff",
        tailwindColor: "slate",
        description: "Structuring separation-of-duty models and authorization frameworks."
      }
    ],
    portfolio: [
      {
        id: "p-ia-1",
        title: "SaaS Operations Compliance Audit",
        skills: ["Risk Control Matrix", "Policy Auditing", "Internal Controls"],
        description: "Designed a lightweight, highly-effective internal security & finance control matrix for a growth-stage software provider.",
        mediaType: "pdf",
        mediaUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
        mediaTitle: "SaaS_Control_Matrix_2025.pdf",
        thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400"
      }
    ]
  },
  {
    id: "virtualassistant",
    name: "Virtual Assistance",
    accentColor: "#9333ea",
    textColor: "#ffffff",
    tailwindColor: "purple",
    shortDesc: "Professional remote support for high-volume corporate administration.",
    overallDescription: "Streamline your working day. Our dedicated virtual assistants act as your executive administrative arm, organizing calendars, filtering customer support tickets, and managing database upkeep with flawless execution.",
    iconName: "UserCheck",
    subServices: [
      {
        id: "va-1",
        name: "Executive Calendar & Mail",
        accentColor: "#9333ea",
        textColor: "#ffffff",
        tailwindColor: "purple",
        description: "Precision management of double-booked schedules, travel bookings, and priority filters."
      }
    ],
    portfolio: [
      {
        id: "p-va-1",
        title: "Multinational Travel & Schedule Optimization",
        skills: ["Schedule Management", "Email Delegation", "Travel Coordination"],
        description: "Restructured the personal and professional schedules of a regional director, boosting response speed by 40%.",
        mediaType: "pdf",
        mediaUrl: "https://images.unsplash.com/photo-1521791136368-1a46827d0515?auto=format&fit=crop&q=80&w=800",
        mediaTitle: "Director_Scheduling_Protocol.pdf",
        thumbnailUrl: "https://images.unsplash.com/photo-1521791136368-1a46827d0515?auto=format&fit=crop&q=80&w=400"
      }
    ]
  }
];

export const FAQS = [
  {
    id: "faq-1",
    question: "How do we securely transfer financial files?",
    answer: "We prioritize security above all else. We utilize end-to-end encrypted folders on OneDrive, Google Drive, or Dropbox. You retain full file custody, and we only gain read-and-edit access to specified transaction folders."
  },
  {
    id: "faq-2",
    question: "Do you sign Non-Disclosure Agreements (NDAs)?",
    answer: "Absolutely. Before any account details or internal systems are shared, we issue a mutually-binding NDA to safeguard your trade secrets, financial records, and operational data."
  },
  {
    id: "faq-3",
    question: "Which accounting software do you support?",
    answer: "We are officially certified in QuickBooks Online, Xero, Wave, and Sage. For custom spreadsheets, we design advanced Excel and Google Sheets dashboards utilizing fully native automated macros."
  },
  {
    id: "faq-4",
    question: "How does the dual-timezone PKT setup work?",
    answer: "Our operations span both Eastern Standard Time (EST) and Pakistan Standard Time (PKT). This allows us to offer overnight reconciliations: you wrap up your day in the US, and our specialists process your ledgers, providing clean reporting before your next morning begins."
  }
];

export const RATINGS = [
  {
    id: "rate-1",
    serviceId: "bookkeeping",
    comment: "Our ledgers were a total mess after switching storefront providers. OneStop reconstructed three fiscal quarters of historical bookkeeping in just five days. Our CPA was ecstatic!",
    name: "Eleanor Vance",
    designation: "CEO",
    company: "Lumina Retail",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    country: "United States"
  },
  {
    id: "rate-2",
    serviceId: "msoffice",
    comment: "The underwriting spreadsheets they automated have saved our team easily 15 hours every single week. Highly recommend their Excel macro support!",
    name: "Marcus Aureli",
    designation: "Managing Director",
    company: "Apex Equity",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    country: "Canada"
  },
  {
    id: "rate-3",
    serviceId: "bookkeeping",
    comment: "Tax compliance went from being a year-end nightmare to a smooth, fully organized walk in the park. Absolute professionals who respond instantly.",
    name: "Sana Chaudhry",
    designation: "Co-Founder",
    company: "Indus Logistics",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
    country: "Pakistan"
  }
];

export const RESOURCES: ResourceItem[] = [
  {
    id: "res-1",
    category: "Excel Automation",
    title: "Small Business Cash Flow Projection Sheet",
    description: "A highly-optimized monthly Cash Flow calculator complete with interactive forecast graphs and dynamic cost scenarios.",
    fileType: "XLSX Template",
    fileSize: "2.4 MB",
    downloadCount: 342
  },
  {
    id: "res-2",
    category: "Bookkeeping",
    title: "GAAP Tax Readiness Checklist",
    description: "A comprehensive checklist to guide your small business through closing year-end books and preparing tax profiles for your CPA.",
    fileType: "PDF Document",
    fileSize: "840 KB",
    downloadCount: 512
  },
  {
    id: "res-3",
    category: "Internal Audit",
    title: "E-Commerce Fraud Audit Guide",
    description: "A professional checklist summarizing internal checks and payout safeguards for Shopify and Stripe storefronts.",
    fileType: "PDF Document",
    fileSize: "1.1 MB",
    downloadCount: 189
  }
];

/* ===================================================================
 * MOCK TEAM MEMBERS — exported here so App.tsx and AdminDashboard can
 * import from a single source of truth. (TeamSection.tsx still exports
 * its own copy as INITIAL_TEAM_MEMBERS for backward compatibility, but
 * this is the canonical seed list.)
 * =================================================================== */
export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "member-1",
    name: "Sophia Martinez, CPA",
    role: "Lead Certified Accountant & QBO Pro",
    bio: "Ex-KPMG consultant specializing in comprehensive GAAP auditing, forensic accounting, and complex catch-up bookkeeping reconstruction.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    specialties: ["QuickBooks Pro", "Forensic Auditing", "Back-Tax Prep"],
    isOnline: true,
    email: "accounting@onestop.com"
  },
  {
    id: "member-2",
    name: "Marcus Sterling",
    role: "Director of MS Office & Spreadsheet Automation",
    bio: "VBA Architect who has automated cash flow models and corporate dashboards for over 80 small businesses, saving hundreds of operational hours.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    specialties: ["VBA Macros", "Financial Projection Models", "Office Automation"],
    isOnline: true,
    email: "automation@onestop.com"
  },
  {
    id: "member-3",
    name: "Victoria Thorne",
    role: "Senior Risk Auditor & Administrative Lead",
    bio: "Certified internal control specialist managing security-vetted virtual support structures, operational audits, and corporate NDAs.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    specialties: ["Internal Auditing", "Risk Assessment", "Corporate Administration"],
    isOnline: true,
    email: "audit@onestop.com"
  }
];

/* ===================================================================
 * TEAM — canonical data for the public TeamSection (new design from
 * zip). Includes both old-shape fields (for backward compatibility
 * with AdminDashboard / api-client mappings) and new-shape fields
 * (title / pictureUrl / experience / certifications) consumed by the
 * updated TeamSection component.
 * =================================================================== */
export const TEAM: TeamMember[] = [
  {
    id: 'tm1',
    name: 'Muhammad Farhan',
    role: 'Lead Accounting Specialist & Certified ProAdvisor',
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    specialties: [],
    isOnline: true,
    email: '',
    title: 'Lead Accounting Specialist & Certified ProAdvisor',
    pictureUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    experience: '8+ Years',
    certifications: [
      'Intuit QuickBooks Certified ProAdvisor',
      'Advanced Certified Bookkeeper',
      'Xero Certified Advisor'
    ]
  },
  {
    id: 'tm2',
    name: 'Sidra Amin',
    role: 'Senior Microsoft Office Architect & Admin Lead',
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    specialties: [],
    isOnline: true,
    email: '',
    title: 'Senior Microsoft Office Architect & Admin Lead',
    pictureUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    experience: '6+ Years',
    certifications: [
      'Microsoft Office Specialist (MOS) Excel Expert',
      'Adobe Acrobat Certified Professional',
      'Certified Virtual Assistant (CVA)'
    ]
  },
  {
    id: 'tm3',
    name: 'Tariq Mehmood',
    role: 'Internal Audit Director & Risk Consultant',
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    specialties: [],
    isOnline: false,
    email: '',
    title: 'Internal Audit Director & Risk Consultant',
    pictureUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    experience: '10+ Years',
    certifications: [
      'Certified Internal Auditor (CIA)',
      'Association of Chartered Certified Accountants (ACCA)',
      'SOX Compliance Specialist'
    ]
  }
];

/* ===================================================================
 * MOCK ENQUIRIES — seeded so the admin Contacts tab shows realistic
 * entries even when the backend is unreachable.
 * =================================================================== */
export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'q-1',
    name: 'James C.',
    contactMethod: 'email',
    contactInfo: 'james@lumina.io',
    subject: 'Custom Excel Macro Automation',
    message: 'Hello, we are looking to integrate dynamic Shopify dashboards with an offline Excel workbook. Can we schedule a quick call to talk details?',
    selectedService: 'MS Office Automation',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
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
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    isAnswered: true,
    timezone: 'Pakistan (PKT)'
  }
];

/* ===================================================================
 * MOCK CONSULTATIONS — seeded so the admin Contacts tab shows realistic
 * booked consultations even when the backend is unreachable.
 * =================================================================== */
export const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: 'c-1',
    name: 'Marcus K.',
    email: 'm.keller@apex.com',
    country: 'Germany',
    selectedDateTime: 'Jul 15, 2026, 3:30 PM (CEST)',
    timezone: 'Europe/Berlin',
    pktTime: '15-Jul-2026 6:30 PM (PKT)',
    isAnswered: false,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
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
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

/* ===================================================================
 * INITIAL_SITE_STATS — default counters shown on the public Records
 * section. Used as a fallback when the backend returns zeros.
 * =================================================================== */
export const INITIAL_SITE_STATS = {
  clients: 140,
  orders: 380,
  countries: 18,
  label: ''
};

/* ===================================================================
 * INITIAL_RATINGS — RATINGS mapped with isApproved: true so the public
 * RatingsSection shows them immediately without needing admin approval.
 * =================================================================== */
export const INITIAL_RATINGS: Rating[] = RATINGS.map(r => ({ ...r, isApproved: true }));
