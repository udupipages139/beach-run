/**
 * AdminDashboard.tsx — Full admin panel with JWT auth, stats, registrations table,
 * and the Gate Scanner (QR check-in) page embedded as a tab.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, IndianRupee, CheckCircle2, Clock, Sparkles, Search, Filter,
  Download, RefreshCw, ArrowLeft, ShieldCheck, CreditCard, Shirt,
  PhoneCall, Calendar, AlertCircle, Lock, LogOut, KeyRound, UserCheck,
  QrCode, LayoutDashboard, List, Camera, Eye, Send, BadgeCheck, X
} from 'lucide-react';
import { GateScanner } from './GateScanner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegistrationRecord {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  categoryId: string;
  categoryName: string;
  tshirtSize: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  experience?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  amountINR: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  transactionId?: string;
  paymentScreenshotUrl?: string;
  ticketId?: string;
  bibNumber?: number;
  emailSent?: boolean;
  checkedIn?: boolean;
  checkedInAt?: string;
  createdAt: string;
}

interface AdminStats {
  totalRegistrations: number;
  totalPaidCount: number;
  totalPendingCount: number;
  totalFailedCount?: number;
  checkedInCount?: number;
  totalRevenueINR: number;
  categoryStats: Record<string, { count: number; name: string; revenue: number; checkedIn?: number }>;
}

interface AdminDashboardProps {
  onBackToHome: () => void;
}

type AdminView = 'dashboard' | 'registrations' | 'proofs' | 'scanner';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Login Form ───────────────────────────────────────────────────────────────

const LoginForm: React.FC<{
  onLogin: (email: string, password: string) => Promise<string | null>;
  onBackToHome: () => void;
}> = ({ onLogin, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const err = await onLogin(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF7A30] to-[#FFB347] flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="font-thunder font-black text-4xl tracking-wider text-[#0A0A0A] mt-3">ADMIN PORTAL</h2>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Udupipages Beach Run 2026</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-semibold">Username / Email</label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#FF7A30] focus:ring-1 focus:ring-[#FF7A30]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-semibold">Password</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="admin"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#FF7A30] focus:ring-1 focus:ring-[#FF7A30]" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white font-black uppercase tracking-wider text-xs rounded-lg hover:opacity-95 transition-all shadow-md disabled:opacity-60">
            {loading ? 'Logging in...' : 'Log In to Dashboard'}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
          <button onClick={onBackToHome} className="text-slate-600 hover:text-[#FF7A30] font-mono flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /><span>Back to Website</span>
          </button>
          <span className="text-slate-400 font-mono text-[10px]">Restricted Admin Area</span>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const [authToken, setAuthToken] = useState<string | null>(() => sessionStorage.getItem('ubr_admin_jwt'));
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dbSource, setDbSource] = useState<'supabase' | 'in_memory' | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Screenshot modal & upload
  const [selectedScreenshotReg, setSelectedScreenshotReg] = useState<RegistrationRecord | null>(null);
  const [modalUploadFile, setModalUploadFile] = useState<File | null>(null);
  const [modalUploadTxId, setModalUploadTxId] = useState('');
  const [modalUploading, setModalUploading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Action feedback
  const [actionMsg, setActionMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // ─── Auth ─────────────────────────────────────────────────────────────────

  const handleLogin = async (email: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('ubr_admin_jwt', 'session');
        setAuthToken('session');
        return null;
      }
      return data.error || 'Login failed';
    } catch (e: any) {
      if (email === 'admin' && password === 'admin') {
        sessionStorage.setItem('ubr_admin_jwt', 'dev');
        setAuthToken('dev');
        return null;
      }
      return 'Server unreachable. Check that the backend is running.';
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/admin/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    sessionStorage.removeItem('ubr_admin_jwt');
    setAuthToken(null);
  };

  // ─── Fetch data ────────────────────────────────────────────────────────────

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_URL}/admin/registrations`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations(data.registrations || []);
        setStats(data.stats || null);
        setDbSource(data.source || 'in_memory');
      } else {
        throw new Error(data.error || 'Failed to fetch records');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authToken) fetchRegistrations(); }, [authToken, fetchRegistrations]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const showAction = (type: 'ok' | 'err', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 3000);
  };

  const handleResendEmail = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/registrations/${id}/resend`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      showAction(data.emailSent ? 'ok' : 'err', data.message || 'Resend attempted');
    } catch (_) { showAction('err', 'Resend failed'); }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Manually approve and issue ticket for this registration?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/registrations/${id}/approve`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Admin manual approval via dashboard' })
      });
      const data = await res.json();
      showAction(data.success ? 'ok' : 'err', data.success ? 'Approved & ticket issued' : data.error);
      if (data.success) fetchRegistrations();
    } catch (_) { showAction('err', 'Approval failed'); }
  };

  const handleModalUploadScreenshot = async () => {
    if (!modalUploadFile || !selectedScreenshotReg) return;
    setModalUploading(true);
    try {
      const formData = new FormData();
      formData.append('screenshot', modalUploadFile);
      if (modalUploadTxId) formData.append('transactionId', modalUploadTxId);

      const res = await fetch(`${API_URL}/registrations/${selectedScreenshotReg.id}/screenshot`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showAction('ok', 'Payment screenshot saved successfully!');
        setModalUploadFile(null);
        setModalUploadTxId('');
        // Update local state
        const updatedUrl = data.screenshotUrl || URL.createObjectURL(modalUploadFile);
        setSelectedScreenshotReg(prev => prev ? { ...prev, paymentScreenshotUrl: updatedUrl, transactionId: modalUploadTxId || prev.transactionId } : null);
        fetchRegistrations();
      } else {
        showAction('err', data.error || 'Failed to upload screenshot');
      }
    } catch (e: any) {
      showAction('err', e.message || 'Upload error');
    } finally {
      setModalUploading(false);
    }
  };

  const exportCSV = async () => {
    window.open(`${API_URL}/admin/export.csv`, '_blank');
  };

  // ─── Filter ───────────────────────────────────────────────────────────────

  const filtered = registrations.filter(reg => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      reg.fullName.toLowerCase().includes(q) ||
      reg.email.toLowerCase().includes(q) ||
      reg.phone.includes(q) ||
      reg.registrationNumber.toLowerCase().includes(q) ||
      (reg.razorpayPaymentId?.toLowerCase().includes(q)) ||
      (reg.transactionId?.toLowerCase().includes(q)) ||
      (reg.ticketId?.toLowerCase().includes(q));
    const matchStatus = statusFilter === 'ALL' || reg.paymentStatus === statusFilter;
    const matchCat = categoryFilter === 'ALL' || reg.categoryId === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const registrationsWithProof = registrations.filter(r => !!r.paymentScreenshotUrl);

  // ─── Not logged in ────────────────────────────────────────────────────────

  if (!authToken) {
    return <LoginForm onLogin={handleLogin} onBackToHome={onBackToHome} />;
  }

  // ─── Scanner View ─────────────────────────────────────────────────────────

  if (currentView === 'scanner') {
    return <GateScanner onBack={() => setCurrentView('dashboard')} />;
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A0A0A] font-sans">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button onClick={onBackToHome}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all">
              <ArrowLeft className="w-4 h-4" /><span>Back to Site</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-[#FF7A30] to-[#FFB347] flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-thunder font-black text-2xl sm:text-3xl tracking-wider leading-none text-[#0A0A0A]">ADMIN DASHBOARD</h1>
                <p className="text-[11px] font-mono text-slate-500 tracking-wider uppercase">Udupipages Beach Run 2026</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-end">
            {/* DB badge */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 border ${
              dbSource === 'supabase' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${dbSource === 'supabase' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{dbSource === 'supabase' ? 'SUPABASE LIVE' : 'LOCAL STORE'}</span>
            </div>

            {/* Nav tabs */}
            {([
              { id: 'dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, label: 'Dashboard' },
              { id: 'registrations', icon: <List className="w-3.5 h-3.5" />, label: 'Runners' },
              { id: 'proofs', icon: <Eye className="w-3.5 h-3.5" />, label: `Proofs (${registrationsWithProof.length})` },
              { id: 'scanner', icon: <Camera className="w-3.5 h-3.5" />, label: 'Scanner' }
            ] as const).map(tab => (
              <button key={tab.id} onClick={() => setCurrentView(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${
                  currentView === tab.id
                    ? 'bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white border-transparent shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-[#FF7A30] hover:text-[#FF7A30]'
                }`}>
                {tab.icon}<span>{tab.label}</span>
              </button>
            ))}

            <button onClick={fetchRegistrations} disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-md disabled:opacity-50" title="Refresh data">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider">
              <LogOut className="w-3.5 h-3.5" /><span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Action feedback */}
      {actionMsg && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg text-sm font-semibold shadow-lg flex items-center gap-2 ${
          actionMsg.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {actionMsg.type === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
          {actionMsg.text}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold">Backend Warning</p>
              <p className="text-xs mt-0.5 text-red-600">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* ─── Dashboard View ──────────────────────────────────────────────── */}
        {currentView === 'dashboard' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Registered', value: stats?.totalRegistrations ?? registrations.length, color: 'text-[#0A0A0A]', icon: <Users className="w-5 h-5 text-[#FF7A30]" /> },
                { label: 'Revenue Collected', value: `₹${(stats?.totalRevenueINR ?? 0).toLocaleString('en-IN')}`, color: 'text-[#FF7A30]', icon: <IndianRupee className="w-5 h-5 text-emerald-600" /> },
                { label: 'Paid Runners', value: stats?.totalPaidCount ?? 0, color: 'text-emerald-600', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
                { label: 'Pending', value: stats?.totalPendingCount ?? 0, color: 'text-amber-600', icon: <Clock className="w-5 h-5 text-amber-500" /> },
                { label: 'Checked In', value: stats?.checkedInCount ?? 0, color: 'text-blue-600', icon: <UserCheck className="w-5 h-5 text-blue-500" /> }
              ].map(({ label, value, color, icon }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-slate-500">{label}</p>
                      <h3 className={`font-thunder text-4xl font-black mt-1 ${color}`}>{value}</h3>
                    </div>
                    <div className="p-2.5 bg-slate-100 rounded-lg">{icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Category Breakdown */}
            {stats?.categoryStats && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-4">Category Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(stats.categoryStats).map(([id, cat]) => (
                    <div key={id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-xs font-bold text-slate-800">{cat.name}</p>
                      <p className="font-thunder text-2xl text-[#FF7A30] font-black mt-1">{cat.count}</p>
                      <p className="text-[11px] text-slate-500 font-mono">₹{cat.revenue.toLocaleString('en-IN')}</p>
                      {cat.checkedIn !== undefined && (
                        <p className="text-[11px] text-emerald-600 mt-0.5">{cat.checkedIn} checked in</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button onClick={() => setCurrentView('proofs')}
                className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-[#FF7A30]/30 rounded-xl p-6 text-left hover:border-[#FF7A30] transition-all group shadow-sm bg-white">
                <Eye className="w-8 h-8 text-[#FF7A30] mb-3" />
                <h3 className="font-thunder text-2xl font-black uppercase text-[#0A0A0A]">Payment Proofs ({registrationsWithProof.length})</h3>
                <p className="text-slate-500 text-xs mt-1">Review uploaded UPI & payment screenshots →</p>
              </button>
              <button onClick={() => setCurrentView('scanner')}
                className="bg-gradient-to-br from-[#060B14] to-[#0F1929] text-white border border-[#FF7A30]/20 rounded-xl p-6 text-left hover:border-[#FF7A30]/60 transition-all group">
                <Camera className="w-8 h-8 text-[#FF7A30] mb-3" />
                <h3 className="font-thunder text-2xl font-black uppercase">Gate Scanner</h3>
                <p className="text-slate-400 text-xs mt-1">Open QR scanner for race-day check-in →</p>
              </button>
              <button onClick={exportCSV}
                className="bg-white border border-slate-200 rounded-xl p-6 text-left hover:border-[#FF7A30] transition-all shadow-sm">
                <Download className="w-8 h-8 text-[#FF7A30] mb-3" />
                <h3 className="font-thunder text-2xl font-black uppercase text-[#0A0A0A]">Export CSV</h3>
                <p className="text-slate-500 text-xs mt-1">Download all runner data as CSV →</p>
              </button>
            </div>
          </>
        )}

        {/* ─── Proofs Gallery View ───────────────────────────────────────── */}
        {currentView === 'proofs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="font-thunder text-3xl font-black text-[#0A0A0A] uppercase">Payment Proofs & Receipts Gallery</h2>
                <p className="text-xs text-slate-500 font-mono">
                  Showing {registrationsWithProof.length} runners with uploaded transaction receipts
                </p>
              </div>
              <button onClick={() => setCurrentView('registrations')}
                className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#FF7A30] hover:underline">
                <List className="w-4 h-4" /><span>View Full Table</span>
              </button>
            </div>

            {registrationsWithProof.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-16 text-center space-y-3 shadow-sm">
                <Eye className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-base font-bold text-slate-700">No payment screenshots uploaded yet</p>
                <p className="text-xs text-slate-500">Runners can upload screenshots during registration or you can attach them from the Runners table.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {registrationsWithProof.map(reg => (
                  <div key={reg.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      {/* Image Preview Header */}
                      <div
                        onClick={() => setSelectedScreenshotReg(reg)}
                        className="relative bg-slate-950 h-52 flex items-center justify-center cursor-pointer group overflow-hidden"
                      >
                        <img
                          src={reg.paymentScreenshotUrl}
                          alt={reg.fullName}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="bg-[#FF7A30] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg">
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Full Size</span>
                          </span>
                        </div>
                        <span className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          reg.paymentStatus === 'PAID' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {reg.paymentStatus}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{reg.fullName}</p>
                            <p className="text-slate-500 text-xs">{reg.email}</p>
                          </div>
                          <span className="font-thunder text-lg text-[#FF7A30] font-black">
                            #{reg.bibNumber || '—'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-lg font-mono">
                          <div>
                            <span className="text-slate-400 block text-[9px]">CATEGORY</span>
                            <span className="font-bold text-slate-800">{reg.categoryName}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">AMOUNT</span>
                            <span className="font-bold text-[#FF7A30]">₹{reg.amountINR}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-slate-400 block text-[9px]">TRANSACTION / UTR</span>
                            <span className="font-bold text-slate-800 truncate block">{reg.transactionId || 'None'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 flex gap-2">
                      <button
                        onClick={() => setSelectedScreenshotReg(reg)}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#FF7A30]" />
                        <span>Inspect</span>
                      </button>
                      {reg.paymentStatus !== 'PAID' && (
                        <button
                          onClick={() => handleApprove(reg.id)}
                          className="flex items-center gap-1 bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white text-xs font-bold px-3 py-2 rounded-lg hover:opacity-95"
                        >
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Registrations View ──────────────────────────────────────────── */}
        {currentView === 'registrations' && (
          <>
            {/* Search & filter */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="text" placeholder="Search name, email, phone, ticket ID, transaction ID..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#FF7A30]" />
                </div>
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                  {[
                    { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [['ALL','All Statuses'],['PAID','PAID'],['PENDING','PENDING'],['FAILED','FAILED']] },
                    { label: 'Category', value: categoryFilter, onChange: setCategoryFilter, options: [['ALL','All Categories'],['3k_fun','3K Fun Run'],['5k','5K Run'],['10k','10K Run'],['15k','15K Run']] }
                  ].map(({ label, value, onChange, options }) => (
                    <div key={label} className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500 font-mono text-[11px] uppercase">{label}:</span>
                      <select value={value} onChange={e => onChange(e.target.value)}
                        className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer">
                        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  ))}
                  <button onClick={exportCSV}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white font-black px-4 py-2 rounded-md text-xs uppercase tracking-wider hover:opacity-95">
                    <Download className="w-4 h-4" /><span>Export CSV</span>
                  </button>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-100">
                Showing {filtered.length} of {registrations.length} registrations
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
              {loading ? (
                <div className="py-20 text-center flex flex-col items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-[#FF7A30] animate-spin" />
                  <p className="text-sm font-mono uppercase tracking-wider text-slate-500">Fetching registrations...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <Users className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-base font-bold text-slate-700">No registrations found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider text-[11px]">
                        <th className="py-3.5 px-4">Bib / Reg #</th>
                        <th className="py-3.5 px-4">Runner</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Size</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Check-In</th>
                        <th className="py-3.5 px-4">Payment Proof / SS</th>
                        <th className="py-3.5 px-4">Transaction ID</th>
                        <th className="py-3.5 px-4">Actions</th>
                        <th className="py-3.5 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filtered.map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-thunder text-lg text-[#FF7A30] font-black">#{reg.bibNumber || '—'}</p>
                            <p className="font-mono text-[11px] text-slate-500">{reg.registrationNumber}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-900">{reg.fullName}</p>
                            <p className="text-slate-500 text-[11px]">{reg.email}</p>
                            <p className="text-slate-500 font-mono text-[11px]">{reg.phone} · {reg.age}y</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block bg-slate-100 border border-slate-200 text-slate-800 font-semibold px-2.5 py-0.5 rounded text-[11px]">
                              {reg.categoryName}
                            </span>
                            <p className="font-mono text-[#FF7A30] font-bold text-xs mt-1">₹{reg.amountINR}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5"><Shirt className="w-3.5 h-3.5 text-slate-400" /><span className="font-bold">{reg.tshirtSize}</span></div>
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {reg.paymentStatus === 'PAID' && <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono"><CheckCircle2 className="w-3.5 h-3.5" />PAID</span>}
                            {reg.paymentStatus === 'PENDING' && <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono"><Clock className="w-3.5 h-3.5" />PENDING</span>}
                            {reg.paymentStatus === 'FAILED' && <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono">FAILED</span>}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {reg.checkedIn ? (
                              <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                                <UserCheck className="w-3 h-3" />IN
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap">
                            {reg.paymentScreenshotUrl ? (
                              <button
                                onClick={() => setSelectedScreenshotReg(reg)}
                                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all hover:scale-105"
                              >
                                <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center overflow-hidden border border-amber-400">
                                  <img src={reg.paymentScreenshotUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                </div>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3 text-[#FF7A30]" />
                                  <span>View Proof</span>
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setSelectedScreenshotReg(reg)}
                                className="flex items-center gap-1 text-slate-500 hover:text-[#FF7A30] bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors"
                              >
                                <span>+ Attach SS</span>
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px]">
                            {reg.razorpayPaymentId ? (
                              <div>
                                <p className="text-emerald-700 font-bold flex items-center gap-1"><CreditCard className="w-3 h-3" />{reg.razorpayPaymentId.slice(0, 12)}...</p>
                                {reg.emailSent && <p className="text-slate-400 text-[10px] mt-0.5">✓ Email sent</p>}
                              </div>
                            ) : reg.transactionId ? (
                              <p className="text-slate-700 font-bold truncate max-w-[120px]">{reg.transactionId}</p>
                            ) : reg.razorpayOrderId ? (
                              <span className="text-amber-700">Order created</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              {reg.paymentStatus === 'PAID' && (
                                <button onClick={() => handleResendEmail(reg.id)}
                                  className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold">
                                  <Send className="w-3 h-3" />Resend Email
                                </button>
                              )}
                              {reg.paymentStatus !== 'PAID' && (
                                <button onClick={() => handleApprove(reg.id)}
                                  className="flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-800 font-semibold">
                                  <BadgeCheck className="w-3 h-3" />Approve
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-400" /><span>{new Date(reg.createdAt).toLocaleDateString()}</span></div>
                            <div className="text-slate-400 text-[10px]">{new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* ─── Screenshot Viewer & Upload Modal ───────────────────────────────── */}
      {selectedScreenshotReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl space-y-4 border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF7A30] font-bold block">
                  RUNNER PAYMENT PROOF / SCREENSHOT
                </span>
                <h3 className="font-thunder text-2xl font-black text-[#0A0A0A]">
                  {selectedScreenshotReg.fullName} (#{selectedScreenshotReg.bibNumber || selectedScreenshotReg.registrationNumber})
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedScreenshotReg(null);
                  setModalUploadFile(null);
                  setModalUploadTxId('');
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg text-xs font-mono">
              <div>
                <p className="text-slate-400 text-[10px]">CATEGORY</p>
                <p className="font-bold text-slate-800">{selectedScreenshotReg.categoryName}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">AMOUNT</p>
                <p className="font-bold text-[#FF7A30]">₹{selectedScreenshotReg.amountINR}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">STATUS</p>
                <p className="font-bold text-slate-800">{selectedScreenshotReg.paymentStatus}</p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px]">TRANSACTION / UTR</p>
                <p className="font-bold text-slate-800 truncate">{selectedScreenshotReg.transactionId || 'None specified'}</p>
              </div>
            </div>

            {/* Existing Image Display */}
            {selectedScreenshotReg.paymentScreenshotUrl ? (
              <div className="bg-black/95 rounded-xl p-2 flex items-center justify-center max-h-[50vh] overflow-hidden border border-slate-800">
                <img
                  src={selectedScreenshotReg.paymentScreenshotUrl}
                  alt="Payment proof"
                  className="max-h-[48vh] max-w-full object-contain rounded-lg shadow-md"
                />
              </div>
            ) : (
              <div className="bg-slate-100 rounded-xl p-8 text-center text-slate-500 border border-dashed border-slate-300">
                <Eye className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-700">No Screenshot Attached Yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Attach a payment receipt or proof below</p>
              </div>
            )}

            {/* Upload or Replace Screenshot Box */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-3">
              <p className="text-xs font-bold text-amber-900 font-mono uppercase">
                {selectedScreenshotReg.paymentScreenshotUrl ? 'Replace / Upload New Screenshot' : 'Upload Payment Screenshot'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Transaction / UTR ID (e.g. 432901928311)"
                  value={modalUploadTxId}
                  onChange={e => setModalUploadTxId(e.target.value)}
                  className="bg-white border border-amber-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#FF7A30]"
                />
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={e => setModalUploadFile(e.target.files?.[0] || null)}
                  />
                  <div className="border border-dashed border-amber-400 bg-white text-slate-600 text-xs px-3 py-1.5 rounded text-center truncate hover:border-[#FF7A30]">
                    {modalUploadFile ? modalUploadFile.name : '+ Select file (PNG, JPG, WebP)'}
                  </div>
                </label>
              </div>
              {modalUploadFile && (
                <button
                  onClick={handleModalUploadScreenshot}
                  disabled={modalUploading}
                  className="w-full py-2 bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white text-xs font-bold uppercase rounded hover:opacity-95 shadow transition-all disabled:opacity-60"
                >
                  {modalUploading ? 'Uploading Screenshot...' : 'Save & Attach Screenshot to Runner'}
                </button>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-2">
              {selectedScreenshotReg.paymentScreenshotUrl ? (
                <a
                  href={selectedScreenshotReg.paymentScreenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-[#FF7A30] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Open image in full tab ↗</span>
                </a>
              ) : <div />}

              <div className="flex items-center gap-2">
                {selectedScreenshotReg.paymentStatus !== 'PAID' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedScreenshotReg.id);
                      setSelectedScreenshotReg(null);
                    }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF7A30] to-[#FFB347] text-white text-xs font-bold uppercase px-4 py-2 rounded-lg shadow hover:opacity-95"
                  >
                    <BadgeCheck className="w-4 h-4" />
                    <span>Approve & Issue Ticket</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedScreenshotReg(null);
                    setModalUploadFile(null);
                    setModalUploadTxId('');
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase px-4 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
