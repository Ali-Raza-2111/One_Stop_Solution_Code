"""Dashboard aggregation schemas."""
from pydantic import BaseModel


class CountryVisit(BaseModel):
    country:      str
    country_code: str
    visits:       int


class ContactMethodBreakdown(BaseModel):
    method:  str   # email | whatsapp | other
    count:   int
    color:   str   # frontend chart color: blue/green/grey


class ServiceRating(BaseModel):
    service_id:    str
    service_name:  str
    total:         int
    average:       float
    five_star:     int
    four_star:     int
    three_star:    int
    two_star:      int
    one_star:      int


class DashboardResponse(BaseModel):
    total_visits:                int
    total_enquiries:             int
    total_consultations:         int
    total_ratings:               int
    approved_ratings:            int
    overall_average_rating:      float
    visits_by_country:           list[CountryVisit]
    contact_method_breakdown:    list[ContactMethodBreakdown]
    service_wise_ratings:        list[ServiceRating]
