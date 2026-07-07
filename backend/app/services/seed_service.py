"""Seed service — populates DB with the default mock data on first run.

Imported by routes/seed.py (manual trigger) AND by main.py (auto-run on startup if empty).
"""
import copy
import json
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from app.config import settings
from app.models.admin_user import AdminUser
from app.models.service import Service, SubService, PortfolioItem
from app.models.enquiry import Enquiry
from app.models.consultation import Consultation
from app.models.rating import Rating
from app.models.resource import ResourceItem
from app.models.team_member import TeamMember
from app.models.site_stats import SiteStats
from app.models.faq import FAQ
from app.models.contact_platform import ContactPlatform
from app.models.certification import Certification
from app.services.security import hash_password


# ---------- Default data ----------
DEFAULT_ADMIN = {
    "username":      settings.DEFAULT_ADMIN_USERNAME,
    "password":      settings.DEFAULT_ADMIN_PASSWORD,
    "display_name":  settings.DEFAULT_ADMIN_DISPLAY_NAME,
}

DEFAULT_STATS = {"clients": 140, "orders": 380, "countries": 18, "label": "Trusted Performance"}

DEFAULT_SERVICES = [
    {
        "slug": "bookkeeping", "name": "Bookkeeping & Accounting",
        "accent_color": "#6366f1", "text_color": "#ffffff", "tailwind_color": "indigo",
        "short_desc": "Your numbers are always up-to-date and tax-compliant.",
        "overall_description": "Ensure seamless compliance, error-free monthly ledgers, and accurate tax-ready reporting. Our certified remote specialists handle day-to-day accounts management with state-of-the-art tools.",
        "icon_name": "BookOpen", "sort_order": 1,
        "sub_services": [
            {"name": "Weekly Ledgers Maintenance", "accent_color": "#6366f1", "text_color": "#ffffff", "tailwind_color": "indigo",
             "description": "Regular transaction categorization and multi-account ledger upkeep.", "sort_order": 1},
            {"name": "Monthly Financial Reporting", "accent_color": "#4f46e5", "text_color": "#ffffff", "tailwind_color": "indigo",
             "description": "Comprehensive Profit & Loss reports, balance sheets, and cash flow statements.", "sort_order": 2},
        ],
        "portfolio": [
            {"title": "E-Commerce Financial Reconstruction",
             "description": "Reconciled 6 months of messy, high-volume Stripe and Shopify payouts with QuickBooks Online.",
             "skills": ["QuickBooks Online", "Shopify", "Data Reconciliation"],
             "media_type": "pdf",
             "media_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
             "media_title": "Ecommerce_Reconciliation_Report.pdf",
             "thumbnail_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"},
        ],
    },
    {
        "slug": "catchup", "name": "Catch-Up Bookkeeping",
        "accent_color": "#0ea5e9", "text_color": "#ffffff", "tailwind_color": "sky",
        "short_desc": "Expert backlog cleanup to bring your historical books up to date.",
        "overall_description": "Get your back-taxes and books up-to-date with complete ease. Our specialized catch-up bookkeeping services reconcile multi-year transaction backlogs, duplicate invoices, and un-categorized bank feeds. We organize historical data into complete, compliant balance sheets and profit & loss statements so you can file taxes confidently.",
        "icon_name": "BookOpen", "sort_order": 2,
        "sub_services": [
            {"name": "Historical Reconciliation", "accent_color": "#0ea5e9", "text_color": "#ffffff", "tailwind_color": "sky",
             "description": "Meticulous bank statement and credit card feed matching across multiple fiscal periods.", "sort_order": 1},
            {"name": "Back-Tax Audit Prep", "accent_color": "#2563eb", "text_color": "#ffffff", "tailwind_color": "blue",
             "description": "Organizing complex Shopify, Stripe, or bank statements for compliant tax filings.", "sort_order": 2},
        ],
        "portfolio": [
            {"title": "3-Year QuickBooks Online Account Cleanup",
             "description": "Reconciled 36 months of un-categorized transactions, bank feeds, and duplicate accounts for a fast-growing Shopify seller, ensuring flawless back-tax filing.",
             "skills": ["QuickBooks Online", "Bank Feeds", "Historical Reconciliation", "Chart of Accounts"],
             "media_type": "pdf",
             "media_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
             "media_title": "QBO_Cleanup_Case_Study.pdf",
             "thumbnail_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400"},
        ],
    },
    {
        "slug": "tax", "name": "Tax Services",
        "accent_color": "#10b981", "text_color": "#ffffff", "tailwind_color": "emerald",
        "short_desc": "Year-round expert support to maximize tax savings and maintain compliance.",
        "overall_description": "Professional, forward-looking tax solutions designed to minimize your liabilities and maximize deductions. Our certified advisors handle annual returns, state franchise filings, sales tax automation, and quarterly estimations with institutional precision.",
        "icon_name": "Calculator", "sort_order": 3,
        "sub_services": [
            {"name": "Corporate Tax Preparation", "accent_color": "#10b981", "text_color": "#ffffff", "tailwind_color": "emerald",
             "description": "Complete federal and state tax preparation, ensuring optimized deductions and zero compliance errors.", "sort_order": 1},
            {"name": "Strategic Tax Advisory", "accent_color": "#059669", "text_color": "#ffffff", "tailwind_color": "green",
             "description": "Year-round consultation to structure transactions, optimize credits, and defer liabilities.", "sort_order": 2},
        ],
        "portfolio": [
            {"title": "End-of-Year Corporate Financial Reporting & Tax Readiness",
             "description": "Successfully prepared comprehensive year-end balance sheets, income statements, and cash flow statements, resolving a $45k accounts discrepancy to prepare for corporate tax filing.",
             "skills": ["Financial Statements", "Balance Sheets", "Tax Readiness", "GAAP Compliance"],
             "media_type": "pdf",
             "media_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
             "media_title": "Corporate_Financial_Statements_2025.pdf",
             "thumbnail_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400"},
        ],
    },
    {
        "slug": "msoffice", "name": "MS Office Automation",
        "accent_color": "#2563eb", "text_color": "#ffffff", "tailwind_color": "blue",
        "short_desc": "Advanced Excel models, custom macros, and corporate presentations.",
        "overall_description": "Supercharge your business operations. We build complex, highly automated spreadsheet templates, customized VBA/macro workflows, robust financial projection sheets, and high-converting pitch decks.",
        "icon_name": "FileSpreadsheet", "sort_order": 4,
        "sub_services": [
            {"name": "Advanced Excel Modeling", "accent_color": "#2563eb", "text_color": "#ffffff", "tailwind_color": "blue",
             "description": "Dynamic financial forecasting, dynamic dash components, and automated dashboards.", "sort_order": 1},
            {"name": "PowerPoint Pitch Decks", "accent_color": "#1d4ed8", "text_color": "#ffffff", "tailwind_color": "blue",
             "description": "Stunning presentation designs tailored to institutional investment rounds.", "sort_order": 2},
        ],
        "portfolio": [
            {"title": "Real Estate Investment Underwriting Model",
             "description": "Created a fully-automated, multi-scenario underwriting spreadsheet for evaluating multi-family real estate acquisitions.",
             "skills": ["Financial Modeling", "VBA Macros", "Excel Automation"],
             "media_type": "excel",
             "media_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
             "media_title": "RE_Acquisitions_Underwriting_v2.4.xlsx",
             "thumbnail_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400"},
        ],
    },
    {
        "slug": "internalaudit", "name": "Internal Audit",
        "accent_color": "#4b5563", "text_color": "#ffffff", "tailwind_color": "slate",
        "short_desc": "Operational risk matrices, policy reviews, and fraud safeguards.",
        "overall_description": "Secure your operational foundations. Our risk assessment experts audit company accounts, highlight balance discrepancies, and establish internal control matrices to safeguard corporate assets.",
        "icon_name": "ShieldAlert", "sort_order": 5,
        "sub_services": [
            {"name": "Internal Control Design", "accent_color": "#4b5563", "text_color": "#ffffff", "tailwind_color": "slate",
             "description": "Structuring separation-of-duty models and authorization frameworks.", "sort_order": 1},
        ],
        "portfolio": [
            {"title": "SaaS Operations Compliance Audit",
             "description": "Designed a lightweight, highly-effective internal security & finance control matrix for a growth-stage software provider.",
             "skills": ["Risk Control Matrix", "Policy Auditing", "Internal Controls"],
             "media_type": "pdf",
             "media_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
             "media_title": "SaaS_Control_Matrix_2025.pdf",
             "thumbnail_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400"},
        ],
    },
    {
        "slug": "virtualassistant", "name": "Virtual Assistance",
        "accent_color": "#9333ea", "text_color": "#ffffff", "tailwind_color": "purple",
        "short_desc": "Professional remote support for high-volume corporate administration.",
        "overall_description": "Streamline your working day. Our dedicated virtual assistants act as your executive administrative arm, organizing calendars, filtering customer support tickets, and managing database upkeep with flawless execution.",
        "icon_name": "UserCheck", "sort_order": 6,
        "sub_services": [
            {"name": "Executive Calendar & Mail", "accent_color": "#9333ea", "text_color": "#ffffff", "tailwind_color": "purple",
             "description": "Precision management of double-booked schedules, travel bookings, and priority filters.", "sort_order": 1},
        ],
        "portfolio": [
            {"title": "Multinational Travel & Schedule Optimization",
             "description": "Restructured the personal and professional schedules of a regional director, boosting response speed by 40%.",
             "skills": ["Schedule Management", "Email Delegation", "Travel Coordination"],
             "media_type": "pdf",
             "media_url": "https://images.unsplash.com/photo-1521791136368-1a46827d0515?auto=format&fit=crop&q=80&w=800",
             "media_title": "Director_Scheduling_Protocol.pdf",
             "thumbnail_url": "https://images.unsplash.com/photo-1521791136368-1a46827d0515?auto=format&fit=crop&q=80&w=400"},
        ],
    },
]

DEFAULT_RATINGS = [
    {"service_id": "bookkeeping", "comment": "Our ledgers were a total mess after switching storefront providers. OneStop reconstructed three fiscal quarters of historical bookkeeping in just five days. Our CPA was ecstatic!",
     "name": "Eleanor Vance", "designation": "CEO", "company": "Lumina Retail",
     "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
     "country": "United States", "rating_stars": 5, "is_approved": True},
    {"service_id": "msoffice", "comment": "The underwriting spreadsheets they automated have saved our team easily 15 hours every single week. Highly recommend their Excel macro support!",
     "name": "Marcus Aureli", "designation": "Managing Director", "company": "Apex Equity",
     "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
     "country": "Canada", "rating_stars": 5, "is_approved": True},
    {"service_id": "bookkeeping", "comment": "Tax compliance went from being a year-end nightmare to a smooth, fully organized walk in the park. Absolute professionals who respond instantly.",
     "name": "Sana Chaudhry", "designation": "Co-Founder", "company": "Indus Logistics",
     "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150",
     "country": "Pakistan", "rating_stars": 5, "is_approved": True},
]

DEFAULT_RESOURCES = [
    {"category": "Excel Automation", "title": "Small Business Cash Flow Projection Sheet",
     "description": "A highly-optimized monthly Cash Flow calculator complete with interactive forecast graphs and dynamic cost scenarios.",
     "file_type": "XLSX Template", "file_size": "2.4 MB", "download_count": 342},
    {"category": "Bookkeeping", "title": "GAAP Tax Readiness Checklist",
     "description": "A comprehensive checklist to guide your small business through closing year-end books and preparing tax profiles for your CPA.",
     "file_type": "PDF Document", "file_size": "840 KB", "download_count": 512},
    {"category": "Internal Audit", "title": "E-Commerce Fraud Audit Guide",
     "description": "A professional checklist summarizing internal checks and payout safeguards for Shopify and Stripe storefronts.",
     "file_type": "PDF Document", "file_size": "1.1 MB", "download_count": 189},
]

DEFAULT_TEAM = [
    {"name": "Ali Raza", "role": "Founder & Lead Accountant", "bio": "CPA-qualified finance specialist with 10+ years of cross-border bookkeeping & tax strategy experience.",
     "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
     "specialties": ["QuickBooks Online", "Tax Strategy", "Audit Prep"], "is_online": True, "email": "ali@onestopsolution.com", "sort_order": 1},
    {"name": "Ayesha Khan", "role": "Senior Excel Automation Engineer", "bio": "Builds complex financial models, VBA workflows, and dynamic dashboards for high-growth SaaS firms.",
     "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
     "specialties": ["Excel VBA", "Financial Modeling", "Power Query"], "is_online": True, "email": "ayesha@onestopsolution.com", "sort_order": 2},
    {"name": "Bilal Ahmed", "role": "Virtual Assistance Lead", "bio": "Executive calendar & inbox maestro. Coordinates 30+ bookings weekly across EST & PKT timezones.",
     "avatar_url": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&q=80&w=300",
     "specialties": ["Schedule Management", "Travel Coordination", "Email Triage"], "is_online": False, "email": "bilal@onestopsolution.com", "sort_order": 3},
]


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _utc_hours_ago(h: int) -> datetime:
    return _utc_now() - timedelta(hours=h)


DEFAULT_ENQUIRIES = [
    {"name": "James C.", "contact_method": "email", "contact_info": "james@lumina.io",
     "subject": "Custom Excel Macro Automation",
     "message": "Hello, we are looking to integrate dynamic Shopify dashboards with an offline Excel workbook. Can we schedule a quick call to talk details?",
     "selected_service": "MS Office Automation", "timezone": "United States (EST)", "is_answered": False},
    {"name": "Amina Shah", "contact_method": "whatsapp", "contact_info": "+923009876543",
     "subject": "Historical Catch-Up",
     "message": "Hello, we have 2 years of bookkeeping backlog. Need cleanup urgently for our upcoming audit.",
     "selected_service": "Catch-Up Bookkeeping", "timezone": "Pakistan (PKT)", "is_answered": True},
]

DEFAULT_CONSULTATIONS = [
    {"name": "Marcus K.", "email": "m.keller@apex.com", "country": "Germany",
     "selected_date_time": "Jul 15, 2026, 3:30 PM (CEST)", "timezone": "Europe/Berlin",
     "pkt_time": "15-Jul-2026 6:30 PM (PKT)", "is_answered": False},
    {"name": "Saira Malik", "email": "saira@creativeagencies.com", "country": "Pakistan",
     "selected_date_time": "Jul 18, 2026, 11:00 AM (PKT)", "timezone": "Asia/Karachi",
     "pkt_time": "18-Jul-2026 11:00 AM (PKT)", "is_answered": True},
]

DEFAULT_FAQS = [
    {"question": "What bookkeeping software do you support?",
     "answer": "We are certified in QuickBooks Online, Xero, Sage, and Zoho Books. We can also work with Excel-based ledgers if that's what your business currently uses.",
     "sort_order": 1, "is_active": True},
    {"question": "How quickly can you start working on my books?",
     "answer": "Onboarding typically takes 2-3 business days. For catch-up bookkeeping engagements, we can usually begin within 24 hours of contract signature.",
     "sort_order": 2, "is_active": True},
    {"question": "Do you sign NDAs and handle confidential data?",
     "answer": "Yes. Every team member signs a comprehensive NDA before joining. We use encrypted file transfers and follow GAAP-level confidentiality standards throughout.",
     "sort_order": 3, "is_active": True},
    {"question": "What are your payment terms?",
     "answer": "We invoice monthly with NET-15 terms. For one-off projects (catch-up, audit prep), we request a 50% advance and 50% on delivery.",
     "sort_order": 4, "is_active": True},
    {"question": "Can you work with international clients across timezones?",
     "answer": "Absolutely. Our team operates across PKT, EST, and GMT. We automatically convert meeting times to your local timezone when you book a consultation.",
     "sort_order": 5, "is_active": True},
]

DEFAULT_CONTACT_PLATFORMS = [
    {"name": "LinkedIn", "icon": "Linkedin", "profile_url": "https://www.linkedin.com/company/one-stop-solution",
     "display_order": 1, "is_active": True},
    {"name": "Fiverr", "icon": "Briefcase", "profile_url": "https://www.fiverr.com/onestopsolution",
     "display_order": 2, "is_active": True},
    {"name": "Upwork", "icon": "Briefcase", "profile_url": "https://www.upwork.com/agencies/onestopsolution",
     "display_order": 3, "is_active": True},
]

DEFAULT_CERTIFICATIONS = [
    # Ali Raza (team_member_id=1, will be re-linked after team seed)
    {"team_member_id": 1, "name": "Certified Public Accountant", "short_code": "CPA",
     "issuer": "AICPA", "year_obtained": 2015, "sort_order": 1},
    {"team_member_id": 1, "name": "QuickBooks ProAdvisor", "short_code": "QBP",
     "issuer": "Intuit", "year_obtained": 2018, "sort_order": 2},
    # Ayesha Khan (team_member_id=2)
    {"team_member_id": 2, "name": "Microsoft Office Specialist Excel Expert", "short_code": "MOS",
     "issuer": "Microsoft", "year_obtained": 2019, "sort_order": 1},
    # Bilal Ahmed (team_member_id=3)
    {"team_member_id": 3, "name": "Certified Administrative Professional", "short_code": "CAP",
     "issuer": "IAAP", "year_obtained": 2020, "sort_order": 1},
]


# ---------- Runner ----------
def get_seed_status(db: Session) -> dict:
    return {
        "admin_exists": db.query(AdminUser).count() > 0,
        "services_count": db.query(Service).count(),
        "ratings_count": db.query(Rating).count(),
        "resources_count": db.query(ResourceItem).count(),
        "team_count": db.query(TeamMember).count(),
        "enquiries_count": db.query(Enquiry).count(),
        "consultations_count": db.query(Consultation).count(),
        "faqs_count": db.query(FAQ).count(),
        "contact_platforms_count": db.query(ContactPlatform).count(),
        "certifications_count": db.query(Certification).count(),
        "stats_exists": db.query(SiteStats).count() > 0,
    }


def _wipe_all(db: Session):
    """Delete all data (does NOT drop tables)."""
    for model in (
        Certification, ContactPlatform, FAQ,
        Enquiry, Consultation, PortfolioItem, SubService, Service,
        Rating, ResourceItem, TeamMember, SiteStats,
    ):
        db.query(model).delete()
    # Admin NOT wiped — keep credentials
    db.commit()


def run_seed(db: Session, force: bool = False) -> dict:
    """Seed the database with default data. If force=True, wipe & reseed (admin preserved)."""
    if force:
        _wipe_all(db)

    created: dict[str, int] = {}

    # 1. Admin user
    if not db.query(AdminUser).filter(AdminUser.username == DEFAULT_ADMIN["username"]).first():
        db.add(AdminUser(
            username=DEFAULT_ADMIN["username"],
            password_hash=hash_password(DEFAULT_ADMIN["password"]),
            display_name=DEFAULT_ADMIN["display_name"],
            is_active=True,
        ))
        created["admin"] = 1

    # 2. Site stats singleton
    if not db.query(SiteStats).filter(SiteStats.id == 1).first():
        db.add(SiteStats(id=1, **DEFAULT_STATS))
        created["stats"] = 1

    # 3. Services + nested sub-services + portfolio
    if db.query(Service).count() == 0:
        for sdata in DEFAULT_SERVICES:
            # Deep-copy so the .pop() calls below don't mutate the module-level
            # DEFAULT_SERVICES (which would break a second force-reseed).
            sdata = copy.deepcopy(sdata)
            svc = Service(
                slug=sdata["slug"], name=sdata["name"],
                accent_color=sdata["accent_color"], text_color=sdata["text_color"],
                tailwind_color=sdata["tailwind_color"],
                short_desc=sdata["short_desc"],
                overall_description=sdata["overall_description"],
                icon_name=sdata["icon_name"],
                sort_order=sdata.get("sort_order", 0),
            )
            db.add(svc)
            db.flush()  # get svc.id
            for ss in sdata.get("sub_services", []):
                db.add(SubService(service_id=svc.id, **ss))
            for p in sdata.get("portfolio", []):
                skills = p.pop("skills", [])
                db.add(PortfolioItem(
                    service_id=svc.id,
                    skills=json.dumps(skills, ensure_ascii=False),
                    sort_order=p.pop("sort_order", 0),
                    **p,
                ))
        created["services"] = len(DEFAULT_SERVICES)

    # 4. Ratings
    if db.query(Rating).count() == 0:
        for rdata in DEFAULT_RATINGS:
            db.add(Rating(**rdata))
        created["ratings"] = len(DEFAULT_RATINGS)

    # 5. Resources
    if db.query(ResourceItem).count() == 0:
        for rdata in DEFAULT_RESOURCES:
            db.add(ResourceItem(**rdata))
        created["resources"] = len(DEFAULT_RESOURCES)

    # 6. Team members
    if db.query(TeamMember).count() == 0:
        for tdata in DEFAULT_TEAM:
            # Deep-copy to avoid mutating module-level data on force-reseed.
            tdata = copy.deepcopy(tdata)
            specs = tdata.pop("specialties", [])
            db.add(TeamMember(specialties=json.dumps(specs, ensure_ascii=False), **tdata))
        created["team_members"] = len(DEFAULT_TEAM)

    # 7. Enquiries
    if db.query(Enquiry).count() == 0:
        for i, edata in enumerate(DEFAULT_ENQUIRIES):
            hours_ago = 4 if i == 0 else 24
            e = Enquiry(**edata)
            e.created_at = _utc_hours_ago(hours_ago)
            db.add(e)
        created["enquiries"] = len(DEFAULT_ENQUIRIES)

    # 8. Consultations
    if db.query(Consultation).count() == 0:
        for i, cdata in enumerate(DEFAULT_CONSULTATIONS):
            hours_ago = 2 if i == 0 else 48
            c = Consultation(**cdata)
            c.created_at = _utc_hours_ago(hours_ago)
            db.add(c)
        created["consultations"] = len(DEFAULT_CONSULTATIONS)

    # 9. FAQs
    if db.query(FAQ).count() == 0:
        for fdata in DEFAULT_FAQS:
            db.add(FAQ(**fdata))
        created["faqs"] = len(DEFAULT_FAQS)

    # 10. Contact platforms
    if db.query(ContactPlatform).count() == 0:
        for pdata in DEFAULT_CONTACT_PLATFORMS:
            db.add(ContactPlatform(**pdata))
        created["contact_platforms"] = len(DEFAULT_CONTACT_PLATFORMS)

    # 11. Certifications (linked to team members — assumes team_member_id 1,2,3 exist)
    if db.query(Certification).count() == 0 and db.query(TeamMember).count() > 0:
        # Use first 3 team member ids (in case they aren't 1,2,3 due to existing rows)
        team_ids = [t.id for t in db.query(TeamMember).order_by(TeamMember.id).limit(3).all()]
        for i, cdata in enumerate(DEFAULT_CERTIFICATIONS):
            if i < len(team_ids):
                cdata = {**cdata, "team_member_id": team_ids[i]}
                db.add(Certification(**cdata))
        created["certifications"] = min(len(DEFAULT_CERTIFICATIONS), len(team_ids))

    db.commit()
    return {"seeded": created, "status": get_seed_status(db)}
