import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ShieldCheck, AlertCircle, Loader2, X, ChevronRight,
  Download, Mail, Upload, QrCode, Hash, Clock, MapPin
} from 'lucide-react';
import { loadRazorpayScript } from '../utils/razorpay';
import { Category, RegistrationFormData, OrderResponse, VerificationResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Category data ────────────────────────────────────────────────────────────

const categories: Category[] = [
  { id: '3k_fun', name: '3K FUN RUN', distance: '3 Kilometers', priceINR: 399, isFree: false, description: 'Padukere Ground ➔ Padukare School Ground. Kids & Families welcome.', eligibility: 'All Ages', flagOffTime: '7:00 AM' },
  { id: '5k', name: '5K RUN', distance: '5 Kilometers', priceINR: 599, isFree: false, description: 'Padukere Ground ➔ Blue Wave. Scenic beach run for fitness enthusiasts.', eligibility: 'Age 12+', flagOffTime: '6:30 AM' },
  { id: '10k', name: '10K RUN', distance: '10 Kilometers', priceINR: 799, isFree: false, description: 'Padukere Ground ➔ Mattu Beach. Mid-distance timed challenge.', eligibility: 'Age 16+', flagOffTime: '6:00 AM' },
  { id: '15k', name: '15K RUN', distance: '15 Kilometers', priceINR: 999, isFree: false, description: 'Padukere Ground ➔ Kapu Light House. Full coastal challenge.', eligibility: 'Age 18+', flagOffTime: '5:30 AM' }
];

// ─── Ticket success data ──────────────────────────────────────────────────────

interface TicketData {
  ticketId: string;
  bibNumber: number;
  fullName: string;
  email: string;
  categoryName: string;
  categoryId: string;
  tshirtSize: string;
  transactionId?: string;
  registrationNumber: string;
  qrImageBase64?: string;
  amountINR: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const Register: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categories[1]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // Screenshot upload state (shown in success modal)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [uploadedTransactionId, setUploadedTransactionId] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegistrationFormData & { emergencyContactName: string; emergencyContactPhone: string }>({
    fullName: '', email: '', phone: '', age: 25, categoryId: '5k', tshirtSize: 'M',
    emergencyContact: '', emergencyContactName: '', emergencyContactPhone: '',
    previousExperience: 'First Time Runner (Beginner)'
  });

  const handleOpenRegistration = (cat: Category) => {
    setSelectedCategory(cat);
    setFormData(prev => ({ ...prev, categoryId: cat.id }));
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'age' ? Number(value) : value }));
  };

  // ─── Form Submit & Payment ──────────────────────────────────────────────────

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          previousExperience: formData.previousExperience
        })
      });

      const data: OrderResponse = await response.json();
      if (!response.ok || !data.success) {
        throw new Error((data as any).error || data.message || 'Registration failed.');
      }

      setRegistrationId(data.registrationId || null);

      // Mock / dev mode
      if (data.isMock || !data.keyId || data.keyId === 'rzp_test_mock' || data.keyId?.includes('placeholder')) {
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            razorpay_order_id: data.orderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: `mock_sig_${Date.now()}`
          })
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.error || 'Test payment failed.');

        if (verifyData.ticket || (verifyData.qrImageBase64 && verifyData.bibNumber)) {
          const t: TicketData = verifyData.ticket || {
            ticketId: verifyData.ticketId || '',
            bibNumber: verifyData.bibNumber || 0,
            fullName: verifyData.fullName || formData.fullName,
            email: verifyData.email || formData.email,
            categoryName: verifyData.categoryName || selectedCategory.name,
            categoryId: verifyData.categoryId || selectedCategory.id,
            tshirtSize: verifyData.tshirtSize || formData.tshirtSize,
            transactionId: verifyData.transactionId || verifyData.paymentId || mockPaymentId,
            registrationNumber: verifyData.registrationNumber || '',
            qrImageBase64: verifyData.qrImageBase64,
            amountINR: verifyData.amountINR || selectedCategory.priceINR
          };
          setTicketData(t);
        } else {
          await fetchAndShowTicket(verifyData.ticketId, verifyData.registrationId || data.registrationId);
        }

        setIsModalOpen(false);
        setLoading(false);
        return;
      }

      // Real Razorpay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load. Check your internet connection.');

      const options = {
        key: data.keyId,
        amount: data.amount!,
        currency: data.currency || 'INR',
        name: 'Udupipages Beach Run 2026',
        description: `Registration for ${selectedCategory.name}`,
        image: '/images/logo.png',
        order_id: data.orderId!,
        handler: async (rzpResponse: any) => {
          setLoading(true);
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: rzpResponse.razorpay_order_id,
                razorpay_payment_id: rzpResponse.razorpay_payment_id,
                razorpay_signature: rzpResponse.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) throw new Error(verifyData.error || 'Verification failed.');
            
            if (verifyData.ticket || (verifyData.qrImageBase64 && verifyData.bibNumber)) {
              const t: TicketData = verifyData.ticket || {
                ticketId: verifyData.ticketId || '',
                bibNumber: verifyData.bibNumber || 0,
                fullName: verifyData.fullName || formData.fullName,
                email: verifyData.email || formData.email,
                categoryName: verifyData.categoryName || selectedCategory.name,
                categoryId: verifyData.categoryId || selectedCategory.id,
                tshirtSize: verifyData.tshirtSize || formData.tshirtSize,
                transactionId: verifyData.transactionId || rzpResponse.razorpay_payment_id,
                registrationNumber: verifyData.registrationNumber || '',
                qrImageBase64: verifyData.qrImageBase64,
                amountINR: verifyData.amountINR || selectedCategory.priceINR
              };
              setTicketData(t);
            } else {
              await fetchAndShowTicket(verifyData.ticketId, verifyData.registrationId || data.registrationId);
            }

            setIsModalOpen(false);
          } catch (err: any) {
            setErrorMessage(err.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: formData.fullName, email: formData.email, contact: formData.phone },
        notes: { category: selectedCategory.name, tshirt_size: formData.tshirtSize },
        theme: { color: '#FF7A30' },
        modal: { ondismiss: () => setLoading(false) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const fetchAndShowTicket = async (ticketId?: string, regId?: string) => {
    const idToFetch = ticketId || regId;
    if (!idToFetch) {
      setTicketData({
        ticketId: 'pending',
        bibNumber: 0,
        fullName: formData.fullName,
        email: formData.email,
        categoryName: selectedCategory?.name || '',
        categoryId: selectedCategory?.id || '',
        tshirtSize: formData.tshirtSize,
        registrationNumber: '',
        amountINR: selectedCategory?.priceINR || 0
      });
      return;
    }

    // Try up to 4 times with small delay to ensure ticket finalization has completed
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(`${API_BASE_URL}/tickets/${idToFetch}`);
        const data = await res.json();
        if (data.success && data.ticket && data.ticket.bibNumber && data.ticket.qrImageBase64) {
          setTicketData(data.ticket);
          return;
        }
      } catch (e) {
        console.warn(`[Register] Attempt ${attempt + 1} fetch ticket error:`, e);
      }
      await new Promise(r => setTimeout(r, 800));
    }

    // Final fallback attempt
    try {
      const res = await fetch(`${API_BASE_URL}/tickets/${idToFetch}`);
      const data = await res.json();
      if (data.success && data.ticket) {
        setTicketData(data.ticket);
      } else {
        setTicketData({
          ticketId: ticketId || regId || '',
          bibNumber: 0,
          fullName: formData.fullName,
          email: formData.email,
          categoryName: selectedCategory?.name || '',
          categoryId: selectedCategory?.id || '',
          tshirtSize: formData.tshirtSize,
          registrationNumber: '',
          amountINR: selectedCategory?.priceINR || 0
        });
      }
    } catch (e) {
      console.warn('[Register] Could not fetch ticket:', e);
    }
  };

  const handleDownloadQR = () => {
    if (!ticketData?.qrImageBase64) return;
    const link = document.createElement('a');
    link.href = ticketData.qrImageBase64;
    link.download = `BeachRun2026_Bib${ticketData.bibNumber}_QR.png`;
    link.click();
  };

  const handleScreenshotUpload = async () => {
    if (!screenshotFile || !registrationId) return;
    setUploadingScreenshot(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('screenshot', screenshotFile);
      if (uploadedTransactionId) formDataUpload.append('transactionId', uploadedTransactionId);

      const res = await fetch(`${API_BASE_URL}/registrations/${registrationId}/screenshot`, {
        method: 'POST',
        body: formDataUpload
      });
      if (res.ok) setScreenshotUploaded(true);
    } catch (e) {
      console.warn('[Register] Screenshot upload failed:', e);
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const flagTimes: Record<string, string> = {
    '3k_fun': '7:00 AM', '5k': '6:30 AM', '10k': '6:00 AM', '15k': '5:30 AM'
  };

  return (
    <section id="register" className="py-20 sm:py-28 bg-white text-[#0A0A0A] border-t border-slate-200 relative">
      <div id="races" className="scroll-mt-28" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 space-y-2 sm:space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#FF7A30] uppercase block">
            OFFICIAL REGISTRATION PORTAL
          </span>
          <h2 className="font-thunder text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0A0A0A] uppercase leading-tight tracking-wide">
            Register UdupiPages Beach Run
          </h2>
          <p className="text-xs sm:text-base text-slate-700 font-normal max-w-2xl mx-auto">
            Select your distance category below to secure your bib for 6th December 2026.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((cat) => {
            const isSelected = selectedCategory?.id === cat.id;
            return (
              <div
                key={cat.id}
                className={`relative bg-slate-50 border p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 shadow-md rounded-none ${
                  isSelected
                    ? 'border-[#FF7A30] shadow-[0_4px_25px_rgba(255,122,48,0.25)] scale-[1.02] bg-amber-50/60'
                    : 'border-slate-200 hover:border-[#FF7A30]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2 gap-1">
                    <span className="text-[11px] font-mono text-[#FF7A30] uppercase tracking-wider font-extrabold truncate">
                      {cat.distance}
                    </span>
                    <span className="bg-amber-100 text-[#FF7A30] border border-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 uppercase tracking-wider flex-shrink-0">
                      TIMED BIB
                    </span>
                  </div>
                  <h3 className="font-thunder text-sm sm:text-base md:text-lg font-extrabold text-[#0A0A0A] mb-2.5 tracking-tight leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed mb-4">{cat.description}</p>
                  <div className="space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Flag-Off:</span>
                      <span className="font-semibold text-[#0A0A0A]">{cat.flagOffTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Eligibility:</span>
                      <span className="font-semibold text-[#0A0A0A]">{cat.eligibility}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-3.5 border-t border-slate-200 space-y-3.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 uppercase font-medium">Entry Fee:</span>
                    <span className="font-thunder text-2xl sm:text-3xl text-[#0A0A0A]">
                      <span className="text-[#FF7A30]">₹{cat.priceINR}</span>
                      <span className="text-xs text-slate-500 font-normal ml-1">INR</span>
                    </span>
                  </div>
                  <button
                    onClick={() => handleOpenRegistration(cat)}
                    className="w-full py-3 bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white font-thunder text-base uppercase font-bold tracking-wider hover:scale-[1.02] active:scale-98 transition-transform flex items-center justify-center space-x-2 shadow-md"
                  >
                    <span>SELECT & REGISTER</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs text-slate-600 text-center font-medium">
          <ShieldCheck className="w-4 h-4 text-[#FF7A30]" />
          <span>Encrypted payment processing via Razorpay. UPI, Credit/Debit Cards & Netbanking supported.</span>
        </div>
      </div>

      {/* ─── Registration Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 max-w-xl w-full p-5 sm:p-8 relative my-4 sm:my-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black" aria-label="Close">
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <img src="/images/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
                  <div>
                    <span className="text-xs font-mono text-[#FF7A30] uppercase tracking-widest block font-bold">
                      CATEGORY: {selectedCategory.name}
                    </span>
                    <h3 className="font-thunder text-3xl text-[#0A0A0A]">RUNNER REGISTRATION</h3>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Entry Fee: <strong>₹{selectedCategory.priceINR}</strong> — Razorpay checkout opens on submission.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4 text-sm">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange}
                    placeholder="e.g. Ramesh Bhat"
                    className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] focus:outline-none px-4 py-2.5 text-gray-900" />
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email *</label>
                    <input type="email" name="email" required value={formData.email} onChange={handleInputChange}
                      placeholder="runner@example.com"
                      className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] focus:outline-none px-4 py-2.5 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone *</label>
                    <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] focus:outline-none px-4 py-2.5 text-gray-900" />
                  </div>
                </div>

                {/* Age + T-Shirt */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Age *</label>
                    <input type="number" name="age" required min={5} max={95} value={formData.age} onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] focus:outline-none px-4 py-2.5 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">T-Shirt Size *</label>
                    <select name="tshirtSize" value={formData.tshirtSize} onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] focus:outline-none px-4 py-2.5 text-gray-900">
                      {['XS','S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Running Experience *</label>
                  <select name="previousExperience" value={formData.previousExperience} onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] focus:outline-none px-4 py-2.5 text-gray-900">
                    <option>First Time Runner (Beginner)</option>
                    <option>5K / 10K Completed Before</option>
                    <option>Half Marathon (21K) / 15K Completed</option>
                    <option>Full Marathon / Experienced Runner</option>
                  </select>
                </div>

                {/* Emergency Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Emergency Contact Name *</label>
                    <input type="text" name="emergencyContactName" required value={formData.emergencyContactName} onChange={handleInputChange}
                      placeholder="Parent / Spouse Name"
                      className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] focus:outline-none px-4 py-2.5 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Emergency Phone *</label>
                    <input type="tel" name="emergencyContactPhone" required value={formData.emergencyContactPhone} onChange={handleInputChange}
                      placeholder="+91 9000000000"
                      className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] focus:outline-none px-4 py-2.5 text-gray-900" />
                  </div>
                </div>

                {/* Runner Summary Card */}
                {formData.fullName && formData.email && (
                  <div className="bg-slate-50 border border-slate-200 p-4 mt-2">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">Runner Details Summary</p>
                      <span className="bg-[#FF7A30] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                        {selectedCategory.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><p className="text-slate-400 uppercase text-[10px] font-bold">Full Name</p><p className="font-bold text-slate-900">{formData.fullName}</p></div>
                      <div><p className="text-slate-400 uppercase text-[10px] font-bold">Email Address</p><p className="font-bold text-slate-900 truncate">{formData.email}</p></div>
                      <div><p className="text-slate-400 uppercase text-[10px] font-bold">Phone Number</p><p className="font-bold text-slate-900">{formData.phone}</p></div>
                      <div><p className="text-slate-400 uppercase text-[10px] font-bold">Age</p><p className="font-bold text-slate-900">{formData.age} Years</p></div>
                      <div><p className="text-slate-400 uppercase text-[10px] font-bold">T-Shirt Size</p><p className="font-bold text-[#FF7A30]">{formData.tshirtSize}</p></div>
                      <div><p className="text-slate-400 uppercase text-[10px] font-bold">Running Experience</p><p className="font-bold text-slate-900">{formData.previousExperience}</p></div>
                    </div>
                    {formData.emergencyContactName && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Emergency: {formData.emergencyContactName} {formData.emergencyContactPhone}</span>
                        <span className="font-thunder text-lg text-[#FF7A30] font-black">₹{selectedCategory.priceINR} INR</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <button type="submit" disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white font-thunder text-xl uppercase font-bold tracking-wider hover:opacity-95 transition-all flex items-center justify-center space-x-2 shadow-md disabled:opacity-60">
                    {loading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /><span>PROCESSING...</span></>
                    ) : (
                      <span>PROCEED TO RAZORPAY PAYMENT (₹{selectedCategory.priceINR})</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Ticket Success Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {ticketData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0A0A0A] border border-[#FF7A30]/30 max-w-lg w-full my-4 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#FF7A30] to-[#FFB347] p-6 text-center">
                <CheckCircle2 className="w-10 h-10 text-white mx-auto mb-2" />
                <p className="text-white/80 text-xs font-mono uppercase tracking-[3px]">PAYMENT CONFIRMED</p>
                <h3 className="font-thunder text-4xl text-white font-black mt-1">SEE YOU AT THE COAST!</h3>
              </div>

              <div className="p-6 space-y-5">
                {/* Bib + Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1a1a1a] border border-[#FF7A30]/20 p-4 text-center">
                    <p className="text-[#FF7A30] text-[10px] font-mono uppercase tracking-widest">Bib Number</p>
                    <p className="font-thunder text-5xl text-white font-black mt-1">
                      {ticketData.bibNumber ? `#${ticketData.bibNumber}` : '—'}
                    </p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#FF7A30]/20 p-4 text-center">
                    <p className="text-[#FF7A30] text-[10px] font-mono uppercase tracking-widest">Category</p>
                    <p className="font-thunder text-2xl text-white font-black mt-1">{ticketData.categoryName}</p>
                    <div className="flex items-center justify-center gap-1 mt-1 text-slate-400 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{flagTimes[ticketData.categoryId] || ''}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {ticketData.qrImageBase64 ? (
                  <div className="bg-[#1a1a1a] border border-[#FF7A30]/20 p-5 text-center">
                    <p className="text-[#FF7A30] text-[10px] font-mono uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                      <QrCode className="w-3 h-3" /> GATE ENTRY QR CODE
                    </p>
                    <img src={ticketData.qrImageBase64} alt="QR Code" className="w-48 h-48 mx-auto border-4 border-[#FF7A30]" />
                    <p className="text-slate-500 text-[11px] mt-2">Show this QR at the gate · Also sent to your email</p>
                    <button onClick={handleDownloadQR}
                      className="mt-3 flex items-center gap-2 bg-[#FF7A30] text-white text-xs font-bold uppercase px-4 py-2 mx-auto hover:bg-[#FFB347] transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download QR PNG
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#1a1a1a] border border-[#FF7A30]/20 p-5 text-center">
                    <Loader2 className="w-8 h-8 text-[#FF7A30] animate-spin mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">Generating your QR ticket...</p>
                    <p className="text-slate-500 text-xs mt-1">Check your email: <strong className="text-white">{ticketData.email}</strong></p>
                  </div>
                )}

                {/* Runner Details */}
                <div className="bg-[#1a1a1a] border border-white/10 divide-y divide-white/5">
                  {[
                    { label: 'Runner Name', value: ticketData.fullName },
                    { label: 'Email', value: ticketData.email },
                    { label: 'T-Shirt Size', value: ticketData.tshirtSize },
                    { label: 'Entry Fee', value: `₹${ticketData.amountINR} INR` },
                    { label: 'Transaction ID', value: ticketData.transactionId || 'Processing...' },
                    { label: 'Date & Venue', value: '6 Dec 2026 · Padukere Ground, Udupi' }
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between px-4 py-2.5 text-xs">
                      <span className="text-slate-500">{label}</span>
                      <span className="font-semibold text-white text-right max-w-[55%] break-all">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Email note */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-[#FF7A30] flex-shrink-0" />
                  <span>Ticket QR emailed to <strong className="text-slate-300">{ticketData.email}</strong></span>
                </div>

                {/* Screenshot Upload */}
                {registrationId && !screenshotUploaded && (
                  <div className="bg-[#1a0a00] border border-[#FF7A30]/30 p-4 space-y-3">
                    <p className="text-[#FFB347] text-xs font-mono uppercase tracking-widest">
                      Optional: Upload Payment Screenshot
                    </p>
                    <input
                      type="text"
                      placeholder="Transaction / UTR ID (optional)"
                      value={uploadedTransactionId}
                      onChange={e => setUploadedTransactionId(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 text-white text-xs px-3 py-2 focus:outline-none focus:border-[#FF7A30]"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex-1 cursor-pointer">
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                          onChange={e => setScreenshotFile(e.target.files?.[0] || null)} />
                        <div className="border border-dashed border-[#FF7A30]/40 text-slate-400 text-xs px-3 py-2 text-center hover:border-[#FF7A30] transition-colors truncate">
                          {screenshotFile ? screenshotFile.name : '+ Select screenshot (PNG/JPG/WebP, max 5MB)'}
                        </div>
                      </label>
                      {screenshotFile && (
                        <button onClick={handleScreenshotUpload} disabled={uploadingScreenshot}
                          className="flex items-center gap-1.5 bg-[#FF7A30] text-white text-xs font-bold px-3 py-2 hover:bg-[#FFB347] transition-colors disabled:opacity-60">
                          {uploadingScreenshot ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          Upload
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {screenshotUploaded && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment screenshot uploaded successfully.</span>
                  </div>
                )}

                <button onClick={() => { setTicketData(null); setScreenshotUploaded(false); setScreenshotFile(null); setRegistrationId(null); }}
                  className="w-full py-3 bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white font-thunder text-lg uppercase font-bold">
                  CLOSE — SEE YOU ON RACE DAY 🏃
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Register;
