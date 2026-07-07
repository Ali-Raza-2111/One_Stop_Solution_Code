import React, { useState, useEffect } from 'react';
import { SERVICES } from '../data/mockData';
import { 
  Mail, 
  Phone, 
  ExternalLink, 
  Clock, 
  Calendar, 
  CheckCircle, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';
import ConsultationCalendar from './ConsultationCalendar';

interface ContactSectionProps {
  preSelectedService: string;
  preSelectedPortfolio: string;
  setPreSelectedService: (service: string) => void;
  setPreSelectedPortfolio: (portfolio: string) => void;
  onAddEnquiry?: (enquiry: any) => void;
  onAddConsultation?: (consultation: any) => void;
}

export default function ContactSection({
  preSelectedService,
  preSelectedPortfolio,
  setPreSelectedService,
  setPreSelectedPortfolio,
  onAddEnquiry,
  onAddConsultation
}: ContactSectionProps) {
  // Query Form state
  const [contactMethod, setContactMethod] = useState<'email' | 'whatsapp' | 'other'>('email');
  
  // Email state
  const [emailName, setEmailName] = useState('');
  const [emailAddr, setEmailAddr] = useState('');
  const [emailCountry, setEmailCountry] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [isQuerySubmitted, setIsQuerySubmitted] = useState(false);
  const [submittedQueryData, setSubmittedQueryData] = useState<any>(null);
  
  // WhatsApp state
  const [waName, setWaName] = useState('');
  const [waCountry, setWaCountry] = useState('');
  const [waMsg, setWaMsg] = useState('');
  const [waRedirectUrl, setWaRedirectUrl] = useState('');
  const [isWaPrepared, setIsWaPrepared] = useState(false);

  // Consultation booking state
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookCountry, setBookCountry] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [visitorTimeZone, setVisitorTimeZone] = useState('UTC');
  const [pktTimeStr, setPktTimeStr] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Error/validation feedback states
  const [bookingError, setBookingError] = useState('');

  // Auto-detect visitor's timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
      setVisitorTimeZone(tz);
    } catch (e) {
      setVisitorTimeZone('America/New_York');
    }
  }, []);

  // Update equivalent Pakistan Standard Time (Asia/Karachi)
  useEffect(() => {
    if (!selectedDateTime) {
      setPktTimeStr('');
      return;
    }

    try {
      const date = new Date(selectedDateTime);
      if (isNaN(date.getTime())) {
        setPktTimeStr('');
        return;
      }

      // Format in Asia/Karachi (PKT)
      const formattedPktTime = date.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Karachi',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const formattedPktDate = date.toLocaleDateString('en-US', {
        timeZone: 'Asia/Karachi',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      setPktTimeStr(`${formattedPktDate} at ${formattedPktTime}`);
    } catch (err) {
      setPktTimeStr('Error calculating Pakistan Time');
    }
  }, [selectedDateTime]);

  // Sync pre-selected service fields if user clicks "Order Now" elsewhere
  useEffect(() => {
    if (preSelectedService) {
      setEmailSubject(`Inquiry regarding ${preSelectedService}`);
      if (preSelectedPortfolio) {
        setEmailMsg(`Hi! I am interested in ordering a service similar to your portfolio project: "${preSelectedPortfolio}". Please let me know how we can proceed.`);
      } else {
        setEmailMsg(`Hi! I would like to inquire about your "${preSelectedService}" package.`);
      }
    }
  }, [preSelectedService, preSelectedPortfolio]);

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (contactMethod === 'email') {
      const payload = {
        name: emailName,
        email: emailAddr,
        country: emailCountry,
        subject: emailSubject,
        message: emailMsg,
        package: preSelectedService || 'Custom Scope'
      };
      setSubmittedQueryData(payload);
      setIsQuerySubmitted(true);

      if (onAddEnquiry) {
        onAddEnquiry({
          id: `q-${Date.now()}`,
          name: emailName,
          contactMethod: 'email',
          contactInfo: emailAddr,
          subject: emailSubject,
          message: emailMsg,
          selectedService: preSelectedService || 'Custom Scope',
          timestamp: new Date().toISOString(),
          isAnswered: false,
          timezone: emailCountry || 'Global Market'
        });
      }

      // Clear fields
      setEmailName('');
      setEmailAddr('');
      setEmailCountry('');
      setEmailSubject('');
      setEmailMsg('');
      setPreSelectedService('');
      setPreSelectedPortfolio('');
    } else if (contactMethod === 'whatsapp') {
      const text = encodeURIComponent(`Hello OneStop! My name is ${waName} from ${waCountry}. I am looking to inquire about your remote services. ${waMsg}`);
      const waNumber = '923001234567'; // Demo WhatsApp Business number
      const url = `https://wa.me/${waNumber}?text=${text}`;
      
      setWaRedirectUrl(url);
      setIsWaPrepared(true);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateTime) {
      setBookingError('Please pick a preferred date and time for the meeting.');
      return;
    }
    setBookingError('');

    const localFormatted = new Date(selectedDateTime).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    setBookingDetails({
      name: bookName,
      email: bookEmail,
      country: bookCountry,
      localTime: `${localFormatted} (${visitorTimeZone})`,
      pktTime: pktTimeStr
    });

    if (onAddConsultation) {
      onAddConsultation({
        id: `c-${Date.now()}`,
        name: bookName,
        email: bookEmail,
        country: bookCountry || 'Global Partner',
        selectedDateTime: `${localFormatted} (${visitorTimeZone})`,
        timezone: visitorTimeZone,
        pktTime: pktTimeStr,
        isAnswered: false,
        timestamp: new Date().toISOString()
      });
    }

    setIsBooked(true);
  };

  const resetQueryForm = () => {
    setIsQuerySubmitted(false);
    setSubmittedQueryData(null);
  };

  const resetWaForm = () => {
    setWaName('');
    setWaCountry('');
    setWaMsg('');
    setIsWaPrepared(false);
    setWaRedirectUrl('');
  };

  const resetBooking = () => {
    setBookName('');
    setBookEmail('');
    setBookCountry('');
    setSelectedDateTime('');
    setIsBooked(false);
    setBookingDetails(null);
    setBookingError('');
  };

  return (
    <section id="contact" className="py-24 bg-transparent border-b border-white/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-mono font-bold text-indigo-600 uppercase tracking-widest mb-2">Contact & Booking</p>
          <h2 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-slate-900 mb-4">
            Let's Discuss Your Business Project
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed font-sans">
            Choose to send a secure project inquiry or schedule a free, 15-minute consultation calendar slot directly.
          </p>
        </div>

        {/* Dual Layout Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Column 1: Query & General Contact Methods */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-white/45 shadow-sm">
            <h3 className="text-lg font-sans font-bold text-slate-800 mb-2 flex items-center space-x-2.5">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>1. Submit a Project Query</span>
            </h3>
            <p className="text-xs text-slate-500 font-sans mb-6">
              Pick your preferred communication channel to send direct service requirements.
            </p>

            {/* Toggle tabs */}
            <div className="flex bg-white/35 p-1 rounded-xl mb-6 border border-white/45">
              <button
                type="button"
                onClick={() => {
                  setContactMethod('email');
                  resetQueryForm();
                  resetWaForm();
                }}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  contactMethod === 'email'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-indigo-600'
                }`}
              >
                Send Email Form
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactMethod('whatsapp');
                  resetQueryForm();
                  resetWaForm();
                }}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  contactMethod === 'whatsapp'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-500 hover:text-emerald-600'
                }`}
              >
                WhatsApp Direct
              </button>
              <button
                type="button"
                onClick={() => {
                  setContactMethod('other');
                  resetQueryForm();
                  resetWaForm();
                }}
                className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                  contactMethod === 'other'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Freelance Platforms
              </button>
            </div>

            {/* Tab: Email Form */}
            {contactMethod === 'email' && (
              <>
                {isQuerySubmitted ? (
                  <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-sans font-bold text-slate-800 mb-2">Query Simulated Successfully!</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 font-sans leading-relaxed">
                      Thank you, <strong>{submittedQueryData?.name}</strong>. We have received your request for <strong>{submittedQueryData?.package}</strong> and will follow up within 2 to 4 hours.
                    </p>
                    <div className="bg-white/30 border border-white/45 rounded-xl p-4 text-left text-xs mb-6 shadow-sm">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-2">Inquiry Metadata:</p>
                      <div className="space-y-1 text-slate-800">
                        <div><strong>Subject:</strong> {submittedQueryData?.subject}</div>
                        <div className="mt-2 text-slate-500 italic">"{submittedQueryData?.message}"</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetQueryForm}
                      className="px-4.5 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-xs font-bold border border-indigo-100 transition-all cursor-pointer shadow-sm"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuerySubmit} className="space-y-4">
                    {preSelectedService && (
                      <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start space-x-2.5 shadow-sm">
                        <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-indigo-600 leading-tight">
                            Ordering Package: {preSelectedService}
                          </p>
                          {preSelectedPortfolio && (
                            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                              Inspired by portfolio item: "{preSelectedPortfolio}"
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Name *</label>
                        <input
                          type="text"
                          required
                          value={emailName}
                          onChange={e => setEmailName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 backdrop-blur-md shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={emailAddr}
                          onChange={e => setEmailAddr(e.target.value)}
                          placeholder="jane@company.com"
                          className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 backdrop-blur-md shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Country *</label>
                      <input
                        type="text"
                        required
                        value={emailCountry}
                        onChange={e => setEmailCountry(e.target.value)}
                        placeholder="United States, Australia..."
                        className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 backdrop-blur-md shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Subject *</label>
                      <input
                        type="text"
                        required
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        placeholder="QuickBooks clean up request"
                        className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 backdrop-blur-md shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Project Scope Description *</label>
                      <textarea
                        required
                        rows={4}
                        value={emailMsg}
                        onChange={e => setEmailMsg(e.target.value)}
                        placeholder="Describe your current transaction backlogs, automated excel ideas, or VA needs..."
                        className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 backdrop-blur-md shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all text-center cursor-pointer duration-300 shadow-md shadow-indigo-600/10"
                    >
                      Submit Inquiry Form
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Tab: WhatsApp Direct */}
            {contactMethod === 'whatsapp' && (
              <>
                {isWaPrepared ? (
                  <div className="py-8 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                      <Phone className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-sans font-bold text-slate-800 mb-2">WhatsApp Link Prepared!</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 font-sans leading-relaxed">
                      Due to environment iframe sandboxing, browser windows cannot be opened automatically. Click the serene link button below to securely open WhatsApp and chat with us.
                    </p>
                    <a
                      href={waRedirectUrl}
                      target="_blank"
                      rel="noreferrer referrer"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Launch WhatsApp Chat Now ↗</span>
                    </a>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={resetWaForm}
                        className="text-xs text-indigo-600 hover:text-indigo-800 underline font-bold transition-all"
                      >
                        Edit Information
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleQuerySubmit} className="space-y-4">
                    <div className="p-3.5 bg-white/25 border border-white/45 rounded-xl flex items-start space-x-2.5 shadow-sm backdrop-blur-md">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                        This prepares a secure message redirection to our WhatsApp Business profile, connecting you directly with our coordinators.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={waName}
                        onChange={e => setWaName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/35 backdrop-blur-md shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Country *</label>
                      <input
                        type="text"
                        required
                        value={waCountry}
                        onChange={e => setWaCountry(e.target.value)}
                        placeholder="Australia, Canada..."
                        className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/35 backdrop-blur-md shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Intro Message</label>
                      <textarea
                        rows={3}
                        value={waMsg}
                        onChange={e => setWaMsg(e.target.value)}
                        placeholder="Hi! I am looking for excel macro support..."
                        className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/35 backdrop-blur-md shadow-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all text-center flex items-center justify-center space-x-1.5 cursor-pointer duration-300 shadow-md shadow-emerald-600/10"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Prepare WhatsApp Connection</span>
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Tab: Other Platform Links */}
            {contactMethod === 'other' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-dashed border-white/45 bg-white/10 space-y-4">
                  
                  {/* Upwork */}
                  <div className="flex items-start justify-between pb-4 border-b border-white/40">
                    <div>
                      <h4 className="text-sm font-sans font-bold text-slate-800 flex items-center space-x-1.5">
                        <span>Upwork Premium Agency Profile</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Hire our certified top-rated accountants and admin managers via secure Upwork escrow structures.
                      </p>
                    </div>
                    <a
                      href="https://www.upwork.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-100 rounded-xl font-bold text-[11px] flex items-center space-x-1 transition-all duration-300 shrink-0 ml-3 shadow-sm"
                    >
                      <span>Upwork</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Fiverr */}
                  <div className="flex items-start justify-between pb-4 border-b border-white/40">
                    <div>
                      <h4 className="text-sm font-sans font-bold text-slate-800 flex items-center space-x-1.5">
                        <span>Fiverr Pro Freelancer Page</span>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Instant custom gig orders for Excel dashboards, PowerPoint pitch decks, and fillable PDF creations.
                      </p>
                    </div>
                    <a
                      href="https://www.fiverr.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white border border-emerald-100 rounded-xl font-bold text-[11px] flex items-center space-x-1 transition-all duration-300 shrink-0 ml-3 shadow-sm"
                    >
                      <span>Fiverr</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* LinkedIn */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-sans font-bold text-slate-800 flex items-center space-x-1.5">
                        <span>LinkedIn Company Page</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Connect with our founders and read industry bookkeeping newsletters or company updates.
                      </p>
                    </div>
                    <a
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border border-indigo-100 rounded-xl font-bold text-[11px] flex items-center space-x-1 transition-all duration-300 shrink-0 ml-3 shadow-sm"
                    >
                      <span>LinkedIn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>

                {/* Mandated Platform Fee Disclaimer Box */}
                <div className="p-3.5 bg-white/25 rounded-xl border border-white/45 flex items-start space-x-2.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-semibold">
                    <strong>Note on Fees:</strong> Please be advised that external platforms enforce service commissions (typically 5% to 20%) for secure escrow contracts. Direct flat invoicing remains our primary baseline.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Free 15-Minute Consultation Booking Calendar */}
          <div className="lg:col-span-6 glass-panel rounded-3xl p-6 sm:p-8 border border-white/45 shadow-sm relative overflow-hidden">
            
            {isBooked ? (
              <div className="text-center py-12 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-sans font-bold text-slate-800 mb-2">Consultation Scheduled!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 font-sans leading-relaxed">
                  Excellent. We have prepared calendar credentials and a secure online conference link to: <strong>{bookingDetails?.email}</strong>.
                </p>

                <div className="bg-white/30 rounded-2xl p-5 border border-white/45 text-left space-y-3.5 mb-8 shadow-sm backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/20">
                    <span className="text-slate-500 font-sans">Meeting Guest Name:</span>
                    <span className="font-bold text-slate-800 font-sans">{bookingDetails?.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-white/20">
                    <span className="text-slate-500 font-sans">Guest Country:</span>
                    <span className="font-bold text-slate-800 font-sans">{bookingDetails?.country}</span>
                  </div>
                  <div className="flex flex-col text-xs pb-2 border-b border-white/20 space-y-1">
                    <span className="text-slate-500 font-sans">Your Local Time:</span>
                    <span className="font-bold text-indigo-650 font-mono text-xs">{bookingDetails?.localTime}</span>
                  </div>
                  <div className="flex flex-col text-xs space-y-1">
                    <span className="text-slate-500 font-sans">Equivalent Pakistan Standard Time:</span>
                    <span className="font-bold text-emerald-600 font-mono text-xs">{bookingDetails?.pktTime} (PKT)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetBooking}
                  className="px-6 py-2.5 bg-indigo-55 hover:bg-indigo-600 border border-indigo-100 hover:text-white text-indigo-600 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Book Another Slot
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <h3 className="text-lg font-sans font-bold text-slate-800 mb-2 flex items-center space-x-2.5">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span>2. Schedule Free 15-Min Briefing</span>
                </h3>
                <p className="text-xs text-slate-500 font-sans mb-6">
                  Set up a direct, face-to-face video consultation to coordinate scope, documents, and workflows.
                </p>

                {bookingError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2 border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={bookName}
                      onChange={e => setBookName(e.target.value)}
                      placeholder="Alexander Miller"
                      className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 backdrop-blur-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Email *</label>
                    <input
                      type="email"
                      required
                      value={bookEmail}
                      onChange={e => setBookEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 backdrop-blur-md shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Your Country *</label>
                  <input
                    type="text"
                    required
                    value={bookCountry}
                    onChange={e => setBookCountry(e.target.value)}
                    placeholder="United Kingdom, UAE, etc."
                    className="w-full px-3.5 py-2.5 bg-white/45 border border-white/45 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600/35 backdrop-blur-md shadow-sm"
                  />
                </div>

                {/* Premium consultation calendar widget */}
                <div className="space-y-3">
                  <ConsultationCalendar
                    visitorTimeZone={visitorTimeZone}
                    value={selectedDateTime}
                    onChange={(iso) => {
                      setSelectedDateTime(iso);
                      setBookingError('');
                    }}
                  />
                  {bookingError && (
                    <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-sans">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all text-center cursor-pointer duration-350 shadow-md shadow-indigo-600/10"
                >
                  Schedule Free Video Call
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
