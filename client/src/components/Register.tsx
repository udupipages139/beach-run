import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, AlertCircle, Loader2, X, ChevronRight } from 'lucide-react';
import { loadRazorpayScript } from '../utils/razorpay';
import { Category, RegistrationFormData, OrderResponse, VerificationResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const categories: Category[] = [
  {
    id: '3k_fun',
    name: '3K FUN RUN',
    distance: '3 Kilometers',
    priceINR: 0,
    isFree: true,
    description: 'Padukere Ground ➔ Padukare School Ground (3K). Kids & Senior Citizens walk/run.',
    eligibility: 'Kids, Beginners & Families',
    flagOffTime: '7:00 AM'
  },
  {
    id: '5k',
    name: '5K RUN',
    distance: '5 Kilometers',
    priceINR: 599,
    isFree: false,
    description: 'Padukere Ground ➔ Blue Wave (5K). Scenic beach run for fitness enthusiasts.',
    eligibility: 'Age 12 and above',
    flagOffTime: '6:30 AM'
  },
  {
    id: '10k',
    name: '10K RUN',
    distance: '10 Kilometers',
    priceINR: 799,
    isFree: false,
    description: 'Padukere Ground ➔ Mattu Beach (10K). Mid-distance timed challenge.',
    eligibility: 'Age 16 and above',
    flagOffTime: '6:00 AM'
  },
  {
    id: '15k',
    name: '15K RUN',
    distance: '15 Kilometers',
    priceINR: 999,
    isFree: false,
    description: 'Padukere Ground ➔ Kapu Light House (15K). Full coastal marathon course.',
    eligibility: 'Age 18 and above',
    flagOffTime: '5:30 AM'
  }
];

export const Register: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categories[1]); // Default 5K
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Confirmation State
  const [confirmationData, setConfirmationData] = useState<{
    registrationNumber: string;
    fullName: string;
    categoryName: string;
    isFree: boolean;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    phone: '',
    age: 25,
    categoryId: '5k',
    tshirtSize: 'M',
    emergencyContact: '',
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

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // 1. Send Order Creation Request to Backend
      const response = await fetch(`${API_BASE_URL}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data: OrderResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to initialize registration.');
      }

      // 2. If Free Registration (1K/3K Fun Run), complete immediately
      if (data.isFree) {
        setConfirmationData({
          registrationNumber: data.registrationNumber,
          fullName: formData.fullName,
          categoryName: selectedCategory.name,
          isFree: true
        });
        setLoading(false);
        setIsModalOpen(false);
        return;
      }

      // 3. For Paid Registration: check if running in Mock Test Mode vs Real Razorpay Mode
      if (data.isMock || !data.keyId || data.keyId === 'rzp_test_mock' || data.keyId.includes('placeholder')) {
        console.log('[Register] Running in development mock payment mode');
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = `mock_sig_${Date.now()}`;

        const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: data.orderId,
            razorpay_payment_id: mockPaymentId,
            razorpay_signature: mockSignature
          })
        });

        const verifyData: VerificationResponse = await verifyRes.json();

        if (!verifyRes.ok || !verifyData.success) {
          throw new Error(verifyData.error || 'Test payment verification failed.');
        }

        setConfirmationData({
          registrationNumber: verifyData.registrationNumber || data.registrationNumber,
          fullName: formData.fullName,
          categoryName: selectedCategory.name,
          isFree: false
        });
        setLoading(false);
        setIsModalOpen(false);
        return;
      }

      // 4. Real Razorpay Mode: Trigger official Razorpay Checkout SDK
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay Checkout SDK failed to load. Please check your internet connection.');
      }

      const razorpayKey = data.keyId;

      const options = {
        key: razorpayKey,
        amount: data.amount!,
        currency: data.currency || 'INR',
        name: 'Udupipages Beach Run 2026',
        description: `Registration for ${selectedCategory.name}`,
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=128&q=80',
        order_id: data.orderId!,
        handler: async function (razorpayResponse: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setLoading(true);
          try {
            // Verify payment signature server-side
            const verifyRes = await fetch(`${API_BASE_URL}/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature
              })
            });

            const verifyData: VerificationResponse = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || 'Payment signature verification failed.');
            }

            setConfirmationData({
              registrationNumber: verifyData.registrationNumber || data.registrationNumber,
              fullName: formData.fullName,
              categoryName: selectedCategory.name,
              isFree: false
            });
            setIsModalOpen(false);
          } catch (err: any) {
            console.error('Verification error:', err);
            setErrorMessage(err.message || 'Payment verification failed.');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        notes: {
          category: selectedCategory.name,
          tshirt_size: formData.tshirtSize
        },
        theme: {
          color: '#FF7A30'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpayWindow = new (window as any).Razorpay(options);
      razorpayWindow.open();
    } catch (err: any) {
      console.error('Registration submit error:', err);
      setErrorMessage(err.message || 'An error occurred during registration. Please try again.');
      setLoading(false);
    }
  };

  return (
    <section id="register" className="py-20 sm:py-28 bg-white text-[#0A0A0A] border-t border-slate-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14 space-y-2 sm:space-y-3">
          <span className="text-xs font-semibold tracking-widest text-[#00A3FF] uppercase block">
            OFFICIAL REGISTRATION PORTAL
          </span>
          <h2 className="font-thunder text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#0A0A0A] uppercase leading-tight tracking-wide">
            Register UdupiPages Beach Run
          </h2>
          <p className="text-xs sm:text-base text-slate-700 font-normal max-w-2xl mx-auto">
            Select your distance category below to secure your bib for 6th December 2026.
          </p>
        </div>

        {/* Category Cards Grid */}
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
                    {cat.isFree ? (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-extrabold px-1.5 py-0.5 uppercase tracking-wider flex-shrink-0">
                        FREE ENTRY
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-[#FF7A30] border border-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 uppercase tracking-wider flex-shrink-0">
                        TIMED BIB
                      </span>
                    )}
                  </div>

                  <h3 className="font-thunder text-sm sm:text-base md:text-lg font-extrabold text-[#0A0A0A] mb-2.5 tracking-tight leading-snug">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-slate-600 font-normal leading-relaxed mb-4">
                    {cat.description}
                  </p>

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
                      {cat.isFree ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : (
                        <>
                          <span className="text-[#FF7A30]">₹{cat.priceINR}</span>
                          <span className="text-xs text-slate-500 font-normal ml-1">INR</span>
                        </>
                      )}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenRegistration(cat)}
                    className="w-full py-3 bg-sunset-gradient text-white font-thunder text-base uppercase font-bold tracking-wider hover:scale-[1.02] active:scale-98 transition-transform flex items-center justify-center space-x-2 shadow-md"
                  >
                    <span>SELECT & REGISTER</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Razorpay Test Mode Badge Notice */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-600 text-center font-medium">
          <ShieldCheck className="w-4 h-4 text-[#00A3FF]" />
          <span>Encrypted payment processing via Razorpay. Support for UPI, Credit/Debit Cards & Netbanking.</span>
        </div>

      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {isModalOpen && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 max-w-xl w-full p-5 sm:p-8 relative my-4 sm:my-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-black"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <img src="/images/logo.png" alt="Official Logo" className="h-10 w-auto object-contain" />
                  <div>
                    <span className="text-xs font-mono text-[#00A3FF] uppercase tracking-widest block font-bold">
                      CATEGORY: {selectedCategory.name}
                    </span>
                    <h3 className="font-thunder text-3xl text-[#0A0A0A]">
                      RUNNER REGISTRATION FORM
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {selectedCategory.isFree
                    ? 'Free Category — Complete form for instant confirmation.'
                    : `Entry Fee: ₹${selectedCategory.priceINR} (Razorpay Checkout will open upon submission).`}
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ramesh Bhat"
                    className="w-full bg-white border border-gray-300 focus:border-[#00A3FF] px-4 py-2.5 text-gray-900 outline-none shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="runner@example.com"
                      className="w-full bg-white border border-gray-300 focus:border-[#00A3FF] px-4 py-2.5 text-gray-900 outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full bg-white border border-gray-300 focus:border-[#00A3FF] px-4 py-2.5 text-gray-900 outline-none shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Age *
                    </label>
                    <input
                      type="number"
                      name="age"
                      required
                      min={5}
                      max={95}
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 focus:border-[#00A3FF] px-4 py-2.5 text-gray-900 outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      T-Shirt Size *
                    </label>
                    <select
                      name="tshirtSize"
                      value={formData.tshirtSize}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] px-4 py-2.5 text-gray-900 outline-none shadow-xs"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Previous Running Experience *
                  </label>
                  <select
                    name="previousExperience"
                    value={formData.previousExperience || 'First Time Runner (Beginner)'}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] px-4 py-2.5 text-gray-900 outline-none shadow-xs text-sm"
                  >
                    <option value="First Time Runner (Beginner)">First Time Runner (Beginner)</option>
                    <option value="5K / 10K Completed Before">5K / 10K Completed Before</option>
                    <option value="Half Marathon (21K) / 15K Completed">Half Marathon (21K) / 15K Completed</option>
                    <option value="Full Marathon / Experienced Runner">Full Marathon / Experienced Runner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Emergency Contact Name & Phone *
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    required
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Parent / Spouse Name (+91 9000000000)"
                    className="w-full bg-white border border-gray-300 focus:border-[#FF7A30] px-4 py-2.5 text-gray-900 outline-none shadow-xs"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-sunset-gradient text-white font-thunder text-xl uppercase font-bold tracking-wider hover:opacity-95 transition-all flex items-center justify-center space-x-2 shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>PROCESSING REGISTRATION...</span>
                      </>
                    ) : selectedCategory.isFree ? (
                      <span>CONFIRM FREE REGISTRATION</span>
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

      {/* Registration Confirmation Modal */}
      <AnimatePresence>
        {confirmationData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border-2 border-[#00A3FF] max-w-lg w-full p-8 text-center space-y-6 relative shadow-2xl"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-mono text-[#00A3FF] uppercase tracking-widest block font-bold">
                  REGISTRATION CONFIRMED!
                </span>
                <h3 className="font-thunder text-4xl text-[#0A0A0A] mt-1">
                  SEE YOU AT THE COAST!
                </h3>
              </div>

              <div className="bg-zinc-50 border border-gray-200 p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration ID:</span>
                  <span className="font-mono font-bold text-[#00A3FF] text-sm">
                    {confirmationData.registrationNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Runner Name:</span>
                  <span className="font-bold text-[#0A0A0A]">{confirmationData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-bold text-[#0A0A0A]">{confirmationData.categoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Location:</span>
                  <span className="font-bold text-[#0A0A0A]">6 Dec 2026 | Padukere Ground</span>
                </div>
              </div>

              <p className="text-xs text-gray-700 font-normal">
                A confirmation email with your BIB collection instructions has been sent. Bring this Registration ID on race day.
              </p>

              <button
                onClick={() => setConfirmationData(null)}
                className="w-full py-3 bg-sunset-gradient text-white font-thunder text-lg uppercase font-bold shadow-sm"
              >
                CLOSE CONFIRMATION
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
