export interface SubService {
  id: string;
  name: string;
  accentColor: string;
  textColor: string;
  tailwindColor: string;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  skills: string[];
  description: string;
  mediaType: string;
  mediaUrl: string;
  mediaTitle: string;
  thumbnailUrl: string;
}

export interface Service {
  id: string;
  name: string;
  accentColor: string;
  textColor: string;
  tailwindColor: string;
  shortDesc: string;
  overallDescription: string;
  iconName: string;
  subServices: SubService[];
  portfolio?: PortfolioItem[];
  imageAsset?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  contactMethod: 'email' | 'whatsapp' | 'other';
  contactInfo: string;
  subject: string;
  message: string;
  selectedService: string;
  timestamp: string;
  isAnswered: boolean;
  timezone: string;
}

export interface Consultation {
  id: string;
  name: string;
  email: string;
  country: string;
  selectedDateTime: string;
  timezone: string;
  pktTime: string;
  isAnswered: boolean;
  timestamp: string;
}

export interface Rating {
  id: string;
  serviceId: string;
  comment: string;
  name: string;
  designation: string;
  company: string;
  avatarUrl: string;
  country: string;
  ratingStars?: number;
  isApproved?: boolean;
}

export interface ResourceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  downloadCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  specialties: string[];
  isOnline: boolean;
  email: string;
  // New fields used by the updated TeamSection (from zip)
  title?: string;
  pictureUrl?: string;
  experience?: string;
  certifications?: string[];
}

