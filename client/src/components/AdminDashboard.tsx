import React, { useState, useEffect } from 'react';
import { 
  Users, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard,
  Shirt,
  PhoneCall,
  Calendar,
  AlertCircle,
  Lock,
  LogOut,
  KeyRound,
  UserCheck
} from 'lucide-react';

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
  emergencyContact: string;
  previousExperience?: string;
  status: 'PENDING' | 'PAID' | 'FREE';
  amountINR: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}

interface AdminStats {
  totalRegistrations: number;
  totalPaidCount: number;
  totalFreeCount: number;
  totalPendingCount: number;
  totalRevenueINR: number;
  categoryStats: Record<string, { count: number; name: string; revenue: number }>;
}

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ubr_admin_authenticated') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dbSource, setDbSource] = useState<'supabase' | 'in_memory' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === 'admin' && passwordInput === 'admin') {
      sessionStorage.setItem('ubr_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError(null);
      fetchRegistrations();
    } else {
      setLoginError('Invalid username or password. Please check credentials and try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ubr_admin_authenticated');
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
    setLoginError(null);
  };

  const fetchRegistrations = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_URL}/admin/registrations`);
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations(data.registrations || []);
        setStats(data.stats || null);
        setDbSource(data.source || 'in_memory');
      } else {
        throw new Error(data.error || 'Failed to fetch admin records');
      }
    } catch (err: any) {
      console.error('[AdminDashboard] Fetch error:', err);
      setErrorMsg(err.message || 'Unable to connect to server backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  // Render Login Form if Not Authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-[#0A0A0A] flex items-center justify-center p-4 selection:bg-[#00A3FF] selection:text-white font-sans">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00A3FF] to-[#0066FF] flex items-center justify-center mx-auto shadow-lg shadow-[#00A3FF]/20">
              <Lock className="w-7 h-7 text-white font-black" />
            </div>
            <h2 className="font-thunder font-black text-3xl sm:text-4xl tracking-wider text-[#0A0A0A] mt-3">
              ADMIN PORTAL
            </h2>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              Udupipages Beach Run 2026
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 font-sans">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-semibold">
                Username
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-600 mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#00A3FF] to-[#0066FF] text-white font-black uppercase tracking-wider text-xs rounded-lg hover:opacity-95 transition-all shadow-md shadow-[#00A3FF]/20 cursor-pointer"
            >
              Log In to Dashboard
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center flex justify-between items-center text-xs">
            <button
              onClick={onBackToHome}
              className="text-slate-600 hover:text-[#00A3FF] font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Website</span>
            </button>
            <span className="text-slate-400 font-mono text-[10px]">Restricted Admin Area</span>
          </div>
        </div>
      </div>
    );
  }

  // Filter logic
  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      searchQuery === '' ||
      reg.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.phone.includes(searchQuery) ||
      reg.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (reg.razorpayPaymentId && reg.razorpayPaymentId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || reg.status === statusFilter;

    const matchesCategory =
      categoryFilter === 'ALL' || reg.categoryId === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Export to CSV
  const exportToCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = [
      'Registration #',
      'Full Name',
      'Email',
      'Phone',
      'Age',
      'Category Name',
      'T-Shirt Size',
      'Emergency Contact',
      'Status',
      'Amount (INR)',
      'Razorpay Order ID',
      'Razorpay Payment ID',
      'Registration Date'
    ];

    const csvRows = filteredRegistrations.map((reg) => [
      `"${reg.registrationNumber}"`,
      `"${reg.fullName}"`,
      `"${reg.email}"`,
      `"${reg.phone}"`,
      reg.age,
      `"${reg.categoryName}"`,
      `"${reg.tshirtSize}"`,
      `"${reg.emergencyContact}"`,
      `"${reg.status}"`,
      reg.amountINR,
      `"${reg.razorpayOrderId || ''}"`,
      `"${reg.razorpayPaymentId || ''}"`,
      `"${new Date(reg.createdAt).toLocaleString()}"`
    ]);

    const csvContent = [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UBR2026_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-[#0A0A0A] selection:bg-[#00A3FF] selection:text-white font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Site</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-[#00A3FF] to-[#0066FF] flex items-center justify-center shadow-md shadow-[#00A3FF]/20">
                <ShieldCheck className="w-5 h-5 text-white font-black" />
              </div>
              <div>
                <h1 className="font-thunder font-black text-2xl sm:text-3xl tracking-wider leading-none text-[#0A0A0A]">
                  ADMIN DASHBOARD
                </h1>
                <p className="text-[11px] font-mono text-slate-500 tracking-wider uppercase">
                  Udupipages Beach Run 2026 Registration Engine
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* DB Connection Badge */}
            <div className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-2 border ${
              dbSource === 'supabase'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                dbSource === 'supabase' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <span>{dbSource === 'supabase' ? 'SUPABASE LIVE' : 'LOCAL STORE ACTIVE'}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchRegistrations}
              disabled={loading}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-md transition-all hover:text-slate-900 disabled:opacity-50 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={filteredRegistrations.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-[#00A3FF] to-[#0066FF] text-white font-black px-4 py-2 rounded-md text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-md shadow-[#00A3FF]/15 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 hover:text-red-800 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
        {/* Error Alert if any */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-bold">Backend Connection Warning</p>
              <p className="text-red-600 text-xs mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Stats KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Registrations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Total Registered</p>
                <h3 className="font-thunder text-4xl sm:text-5xl font-black text-[#0A0A0A] mt-1">
                  {stats?.totalRegistrations ?? registrations.length}
                </h3>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-[#00A3FF]">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
              <span>All active runner entries</span>
            </div>
          </div>

          {/* Card 2: Revenue Collected */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Total Revenue</p>
                <h3 className="font-thunder text-4xl sm:text-5xl font-black text-[#00A3FF] mt-1">
                  ₹{(stats?.totalRevenueINR ?? 0).toLocaleString('en-IN')}
                </h3>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-emerald-600">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
              <span>Collected via Razorpay & UPI</span>
            </div>
          </div>

          {/* Card 3: Paid Runners */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Paid Runners</p>
                <h3 className="font-thunder text-4xl sm:text-5xl font-black text-emerald-600 mt-1">
                  {stats?.totalPaidCount ?? 0}
                </h3>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
              <span>Verified payment transactions</span>
            </div>
          </div>

          {/* Card 4: Free Registrations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:shadow-md transition-all shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Free 3K Runners</p>
                <h3 className="font-thunder text-4xl sm:text-5xl font-black text-cyan-600 mt-1">
                  {stats?.totalFreeCount ?? 0}
                </h3>
              </div>
              <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg text-cyan-600">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs text-slate-500">
              <span>Community 3K Fun Run</span>
            </div>
          </div>
        </div>

        {/* Category Breakdown Bar */}
        {stats?.categoryStats && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3">
              Race Plan & Category Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(stats.categoryStats).map(([catId, cat]) => (
                <div key={catId} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="text-xs font-bold text-slate-800">{cat.name}</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xl font-black font-thunder text-[#00A3FF]">{cat.count} runners</span>
                    <span className="text-[11px] font-mono text-slate-500">₹{cat.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controls: Search, Filter, Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, phone, Reg #, Payment ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-md pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A3FF] focus:ring-1 focus:ring-[#00A3FF] transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-mono text-[11px] uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-white text-slate-900">All Statuses</option>
                  <option value="PAID" className="bg-white text-slate-900">PAID</option>
                  <option value="FREE" className="bg-white text-slate-900">FREE</option>
                  <option value="PENDING" className="bg-white text-slate-900">PENDING</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-mono text-[11px] uppercase">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-white text-slate-900">All Categories</option>
                  <option value="3k" className="bg-white text-slate-900">3K Fun Run</option>
                  <option value="5k" className="bg-white text-slate-900">5K Dune Dash</option>
                  <option value="10k" className="bg-white text-slate-900">10K Coastal</option>
                  <option value="15k" className="bg-white text-slate-900">15K Endurance</option>
                </select>
              </div>

              {(searchQuery || statusFilter !== 'ALL' || categoryFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setCategoryFilter('ALL');
                  }}
                  className="text-xs text-[#00A3FF] hover:underline font-mono ml-2 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500 pt-2 border-t border-slate-100 flex justify-between items-center">
            <span>Showing {filteredRegistrations.length} of {registrations.length} registrations</span>
          </div>
        </div>

        {/* Registrations Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
          {loading ? (
            <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#00A3FF] animate-spin" />
              <p className="text-sm font-mono uppercase tracking-wider">Fetching registrations from database...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700">No registrations found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {registrations.length === 0
                  ? 'No runners have registered yet. Complete a registration on the site to see records here.'
                  : 'No records match your active search or filter criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Reg Number</th>
                    <th className="py-3.5 px-4">Runner Info</th>
                    <th className="py-3.5 px-4">Category & Fee</th>
                    <th className="py-3.5 px-4">Size & Emergency</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Transaction Action / Ref</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Registration Number */}
                      <td className="py-4 px-4 font-mono font-bold text-[#00A3FF] whitespace-nowrap">
                        {reg.registrationNumber}
                      </td>

                      {/* Runner Info */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 text-sm">{reg.fullName}</div>
                        <div className="text-slate-500 text-[11px]">{reg.email}</div>
                        <div className="text-slate-500 font-mono text-[11px] flex items-center gap-2 mt-0.5">
                          <span>{reg.phone}</span>
                          <span>•</span>
                          <span>{reg.age} yrs</span>
                        </div>
                      </td>

                      {/* Category & Fee */}
                      <td className="py-4 px-4">
                        <span className="inline-block bg-slate-100 border border-slate-200 text-slate-800 font-semibold px-2.5 py-0.5 rounded text-[11px]">
                          {reg.categoryName}
                        </span>
                        <div className="font-mono text-[#0066FF] font-bold text-xs mt-1">
                          {reg.amountINR === 0 ? 'FREE' : `₹${reg.amountINR}`}
                        </div>
                      </td>

                      {/* Size & Emergency */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Shirt className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold">Size {reg.tshirtSize}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-1">
                          <PhoneCall className="w-3 h-3 text-slate-400" />
                          <span>Emg: {reg.emergencyContact}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {reg.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            PAID
                          </span>
                        )}
                        {reg.status === 'FREE' && (
                          <span className="inline-flex items-center gap-1 bg-cyan-50 border border-cyan-200 text-cyan-700 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                            FREE
                          </span>
                        )}
                        {reg.status === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Transaction Ref */}
                      <td className="py-4 px-4 font-mono text-[11px]">
                        {reg.razorpayPaymentId ? (
                          <div className="text-slate-700">
                            <div className="flex items-center gap-1 text-emerald-700 font-bold">
                              <CreditCard className="w-3 h-3 text-emerald-600" />
                              <span>{reg.razorpayPaymentId}</span>
                            </div>
                            <div className="text-slate-500 text-[10px] truncate max-w-[140px]">
                              Ord: {reg.razorpayOrderId}
                            </div>
                          </div>
                        ) : reg.razorpayOrderId ? (
                          <div className="text-slate-600">
                            <span className="text-amber-700 font-semibold">Order Created</span>
                            <div className="text-slate-500 text-[10px] truncate max-w-[140px]">
                              {reg.razorpayOrderId}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No Online Payment</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(reg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">
                          {new Date(reg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
