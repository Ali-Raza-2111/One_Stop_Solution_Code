"""Dashboard aggregation service.

Returns all the data the admin dashboard charts need in one call:
- Total visits, enquiries, consultations, ratings
- Visits grouped by country (for the country-wise chart)
- Enquiries broken down by contact method (email/whatsapp/other)
- Ratings: overall average + per-service breakdown
"""
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.models.visit import Visit
from app.models.enquiry import Enquiry
from app.models.consultation import Consultation
from app.models.rating import Rating
from app.models.service import Service


def get_dashboard(db: Session) -> dict:
    # ── Totals ─────────────────────────────────────────────
    total_visits        = db.query(func.count(Visit.id)).scalar() or 0
    total_enquiries     = db.query(func.count(Enquiry.id)).scalar() or 0
    total_consultations = db.query(func.count(Consultation.id)).scalar() or 0
    total_ratings       = db.query(func.count(Rating.id)).scalar() or 0
    approved_ratings    = db.query(func.count(Rating.id)).filter(Rating.is_approved == True).scalar() or 0

    overall_avg = (
        db.query(func.avg(Rating.rating_stars))
        .filter(Rating.is_approved == True)
        .scalar()
    )
    overall_average_rating = round(float(overall_avg), 2) if overall_avg else 0.0

    # ── Visits by country ─────────────────────────────────
    visit_rows = (
        db.query(Visit.country, Visit.country_code, func.count(Visit.id).label("visits"))
        .filter(Visit.country != "", Visit.country != "Local", Visit.country != "Unknown")
        .group_by(Visit.country, Visit.country_code)
        .order_by(func.count(Visit.id).desc())
        .limit(20)
        .all()
    )
    visits_by_country = [
        {"country": r.country, "country_code": r.country_code, "visits": int(r.visits)}
        for r in visit_rows
    ]

    # ── Enquiries by contact method ───────────────────────
    # Per requirements: Blue=Email, Light green=WhatsApp, Grey=Other
    method_rows = (
        db.query(Enquiry.contact_method, func.count(Enquiry.id).label("count"))
        .group_by(Enquiry.contact_method)
        .all()
    )
    method_colors = {
        "email": "#3b82f6",     # blue
        "whatsapp": "#22c55e",  # light green
        "other": "#9ca3af",     # grey
    }
    contact_method_breakdown = [
        {
            "method": r.contact_method or "other",
            "count": int(r.count),
            "color": method_colors.get(r.contact_method, "#9ca3af"),
        }
        for r in method_rows
    ]

    # ── Service-wise ratings ──────────────────────────────
    # Ratings link to Service via slug (string), not FK id.
    services = db.query(Service).order_by(Service.sort_order, Service.id).all()
    service_wise = []
    for svc in services:
        rows = db.query(Rating).filter(Rating.service_id == svc.slug, Rating.is_approved == True).all()
        if not rows:
            continue
        total = len(rows)
        avg = sum(r.rating_stars for r in rows) / total
        dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
        for r in rows:
            s = max(1, min(5, int(r.rating_stars)))
            dist[s] += 1
        service_wise.append({
            "service_id": svc.slug,
            "service_name": svc.name,
            "total": total,
            "average": round(avg, 2),
            "five_star": dist[5],
            "four_star": dist[4],
            "three_star": dist[3],
            "two_star": dist[2],
            "one_star": dist[1],
        })

    return {
        "total_visits": total_visits,
        "total_enquiries": total_enquiries,
        "total_consultations": total_consultations,
        "total_ratings": total_ratings,
        "approved_ratings": approved_ratings,
        "overall_average_rating": overall_average_rating,
        "visits_by_country": visits_by_country,
        "contact_method_breakdown": contact_method_breakdown,
        "service_wise_ratings": service_wise,
    }
