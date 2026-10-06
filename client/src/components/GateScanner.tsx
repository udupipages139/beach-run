/**
 * GateScanner.tsx — Admin QR Gate Check-In Page
 * Dark UI, html5-qrcode scanner, manual fallback, atomic check-in
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera, CameraOff, RefreshCw, Search, CheckCircle2, XCircle, AlertTriangle,
  Hash, User, Shirt, Phone, Mail, Clock, QrCode, Zap, ChevronLeft, Wifi,
  CreditCard, Calendar, UserCheck, ShieldAlert
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScanResult = 'SUCCESS' | 'DUPLICATE' | 'INVALID' | 'UNPAID' | null;

interface RunnerDetails {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  categoryName: string;
  categoryId: string;
  tshirtSize: string;
  experience?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bibNumber?: number;
  ticketId?: string;
  transactionId?: string;
  paymentStatus: string;
  checkedIn: boolean;
  checkedInAt?: string;
  registrationNumber: string;
}

interface CheckInResponse {
  success: boolean;
  result: ScanResult;
  message: string;
  registration?: RunnerDetails;
  firstCheckedInAt?: string;
}

// ─── Flag-off times ───────────────────────────────────────────────────────────

const FLAG_TIMES: Record<string, string> = {
  '3k_fun': '7:00 AM', '5k': '6:30 AM', '10k': '6:00 AM', '15k': '5:30 AM'
};

// ─── Sound feedback (Web Audio API) ───────────────────────────────────────────

function playBeep(type: 'success' | 'error') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = type === 'success' ? 880 : 220;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (_) {}
}

function vibrate(type: 'success' | 'error') {
  try {
    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? [100, 50, 100] : [300]);
    }
  } catch (_) {}
}

// ─── Component ────────────────────────────────────────────────────────────────

interface GateScannerProps {
  authToken?: string;
  onBack: () => void;
}

export const GateScanner: React.FC<GateScannerProps> = ({ authToken, onBack }) => {
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResponse | null>(null);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [manualToken, setManualToken] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<RunnerDetails | null>(null);
  const [lookupNotFound, setLookupNotFound] = useState(false);
  const [autoResetTimer, setAutoResetTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [html5QrCodeLib, setHtml5QrCodeLib] = useState<any>(null);
  const [scannerInstance, setScannerInstance] = useState<any>(null);

  const scannerDivId = 'qr-scanner-container';
  const debounceRef = useRef(false);

  // ─── Auth headers ───────────────────────────────────────────────────────────

  const authHeaders = (): Record<string, string> => {
    const base: Record<string, string> = { 'Content-Type': 'application/json' };
    if (authToken) base['Authorization'] = `Bearer ${authToken}`;
    return base;
  };

  // ─── Fetch checked-in count ─────────────────────────────────────────────────

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/checkin-count`, {
        headers: authHeaders(), credentials: 'include'
      });
      const data = await res.json();
      if (data.success) setCheckedInCount(data.count);
    } catch (_) {}
  }, [authToken]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  // ─── Load html5-qrcode lazily ──────────────────────────────────────────────

  useEffect(() => {
    import('html5-qrcode').then(mod => {
      setHtml5QrCodeLib(mod);
    }).catch(e => {
      console.warn('[GateScanner] html5-qrcode not available:', e);
      setCameraAvailable(false);
    });
  }, []);

  // ─── Start/Stop Scanner ─────────────────────────────────────────────────────

  const startScanner = async () => {
    if (!html5QrCodeLib) return;
    try {
      const { Html5Qrcode } = html5QrCodeLib;
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraAvailable(false);
        setManualOpen(true);
        return;
      }
      setCameraAvailable(true);

      // Prefer rear camera
      const cam = cameras.find((c: any) => /back|rear|environment/i.test(c.label)) || cameras[cameras.length - 1];

      const scanner = new Html5Qrcode(scannerDivId);
      setScannerInstance(scanner);

      await scanner.start(
        cam.id,
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1 },
        (decodedText: string) => handleQrScan(decodedText),
        () => {} // errors are expected between scans
      );
      setScannerActive(true);
    } catch (err: any) {
      console.warn('[GateScanner] Camera start failed:', err.message);
      setCameraAvailable(false);
      setManualOpen(true);
    }
  };

  const stopScanner = async () => {
    if (scannerInstance) {
      try {
        await scannerInstance.stop();
      } catch (_) {}
      setScannerInstance(null);
    }
    setScannerActive(false);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  // ─── Auto-reset after 3s ────────────────────────────────────────────────────

  const scheduleReset = () => {
    if (autoResetTimer) clearTimeout(autoResetTimer);
    const t = setTimeout(() => {
      setLastResult(null);
      setLookupResult(null);
      setLookupNotFound(false);
      debounceRef.current = false;
    }, 3500);
    setAutoResetTimer(t);
  };

  // ─── QR Scan Handler (debounced) ─────────────────────────────────────────────

  const handleQrScan = useCallback(async (text: string) => {
    if (debounceRef.current || loading) return;
    debounceRef.current = true;

    setLoading(true);
    setLastResult(null);
    setLookupResult(null);
    setLookupNotFound(false);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/checkin`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ token: text })
      });
      const data: CheckInResponse = await res.json();
      setLastResult(data);

      if (data.result === 'SUCCESS') {
        playBeep('success');
        vibrate('success');
        fetchCount();
      } else {
        playBeep('error');
        vibrate('error');
      }
    } catch (e: any) {
      setLastResult({ success: false, result: 'INVALID', message: 'Network error. Check connection.' });
      playBeep('error');
    } finally {
      setLoading(false);
      scheduleReset();
    }
  }, [authToken, loading]);

  // ─── Manual token verify ────────────────────────────────────────────────────

  const handleManualLookup = async () => {
    if (!manualToken.trim()) return;
    setLoading(true);
    setLastResult(null);
    setLookupResult(null);
    setLookupNotFound(false);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/lookup`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ token: manualToken.trim() })
      });
      const data = await res.json();
      if (data.found && data.registration) {
        setLookupResult(data.registration);
      } else {
        setLookupNotFound(true);
      }
    } catch (_) {
      setLookupNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = async () => {
    if (!manualToken.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/manual-checkin`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'include',
        body: JSON.stringify({ token: manualToken.trim() })
      });
      const data: CheckInResponse = await res.json();
      setLastResult(data);
      setLookupResult(null);
      setLookupNotFound(false);
      if (data.result === 'SUCCESS') {
        playBeep('success');
        vibrate('success');
        fetchCount();
      } else {
        playBeep('error');
        vibrate('error');
      }
      scheduleReset();
    } catch (_) {
      setLastResult({ success: false, result: 'INVALID', message: 'Network error.' });
    } finally {
      setLoading(false);
    }
  };

  // ─── Result screen colors ───────────────────────────────────────────────────

  const resultColors: Record<NonNullable<ScanResult>, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    SUCCESS: {
      bg: 'bg-emerald-950/90', border: 'border-emerald-400',
      text: 'text-emerald-300',
      icon: <CheckCircle2 className="w-16 h-16 text-emerald-400" />
    },
    DUPLICATE: {
      bg: 'bg-red-950/90', border: 'border-red-400',
      text: 'text-red-300',
      icon: <XCircle className="w-16 h-16 text-red-400" />
    },
    INVALID: {
      bg: 'bg-red-950/90', border: 'border-red-500',
      text: 'text-red-300',
      icon: <ShieldAlert className="w-16 h-16 text-red-400" />
    },
    UNPAID: {
      bg: 'bg-amber-950/90', border: 'border-amber-400',
      text: 'text-amber-300',
      icon: <AlertTriangle className="w-16 h-16 text-amber-400" />
    }
  };

  const resultTitles: Record<NonNullable<ScanResult>, string> = {
    SUCCESS: 'VALID — CHECKED IN ✓',
    DUPLICATE: 'ALREADY CHECKED IN',
    INVALID: 'INVALID QR CODE',
    UNPAID: 'PAYMENT NOT CONFIRMED'
  };

  const reg = lastResult?.registration;

  return (
    <div className="min-h-screen bg-[#060B14] text-[#F5F3EE] font-sans">

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF7A30] to-[#FFB347] flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-thunder text-2xl font-black tracking-wider uppercase leading-none">GATE CHECK-IN</h1>
            <p className="text-[11px] text-slate-400 tracking-wider">Udupipages Beach Run 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0F1929] border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[90px]">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Checked In</p>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className="font-thunder text-3xl text-white font-black">{checkedInCount}</span>
              <button onClick={fetchCount} className="text-slate-500 hover:text-[#FF7A30] transition-colors" title="Refresh count">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* ─── Camera Section ───────────────────────────────────────────────── */}
        <div className="text-center space-y-1">
          <p className="text-[#FF7A30] text-xs font-mono font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5" /> POINT CAMERA AT RUNNER QR TICKET
          </p>
          <p className="text-slate-400 text-xs">Hold phone steady over the QR code on screen or printed pass.</p>
        </div>

        {/* Scanner box */}
        <div className="relative bg-[#0F1929] border border-white/10 rounded-2xl overflow-hidden min-h-[300px]">
          {/* html5-qrcode target div */}
          <div id={scannerDivId} className={`w-full ${scannerActive ? 'block' : 'hidden'}`} />

          {/* Camera unavailable state */}
          {cameraAvailable === false && !scannerActive && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3">
              <CameraOff className="w-14 h-14 text-red-400" />
              <p className="font-bold text-white text-lg">Camera Unavailable</p>
              <p className="text-slate-400 text-sm">Unable to access camera. Please check permissions.</p>
              <p className="text-slate-500 text-xs">Use the manual input field below to enter ticket tokens.</p>
              <p className="text-slate-600 text-[11px] mt-2">📱 For phone scanning: access via HTTPS or ngrok tunnel</p>
            </div>
          )}

          {/* Idle/ready state */}
          {cameraAvailable !== false && !scannerActive && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Camera className="w-12 h-12 text-slate-500" />
              <p className="text-slate-400 text-sm">Camera not started</p>
              <button
                onClick={startScanner}
                className="flex items-center gap-2 bg-[#FF7A30] text-white text-xs font-bold uppercase px-5 py-2.5 rounded-lg hover:bg-[#FFB347] transition-colors"
              >
                <Camera className="w-4 h-4" /> START SCANNER
              </button>
            </div>
          )}

          {/* Scanner controls overlay */}
          {scannerActive && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <button
                onClick={stopScanner}
                className="bg-red-600 text-white text-xs font-bold uppercase px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <CameraOff className="w-3.5 h-3.5" /> STOP
              </button>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
              <RefreshCw className="w-10 h-10 text-[#FF7A30] animate-spin" />
            </div>
          )}
        </div>

        {/* ─── Full-screen Result Card ───────────────────────────────────────── */}
        {lastResult && lastResult.result && (
          <div className={`border-2 rounded-2xl p-6 text-center space-y-4 ${resultColors[lastResult.result].bg} ${resultColors[lastResult.result].border}`}>
            <div className="flex justify-center">{resultColors[lastResult.result].icon}</div>
            <div>
              <p className={`font-thunder text-3xl font-black uppercase ${resultColors[lastResult.result].text}`}>
                {resultTitles[lastResult.result]}
              </p>
              <p className="text-slate-300 text-sm mt-1">{lastResult.message}</p>
            </div>

            {/* Runner details */}
            {reg && (
              <div className="bg-black/30 rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2">
                  <Hash className="w-4 h-4 text-[#FF7A30]" />
                  <span className="font-thunder text-2xl text-[#FF7A30] font-black">#{reg.bibNumber || '—'}</span>
                  <span className="ml-auto bg-[#FF7A30]/20 text-[#FFB347] text-[11px] font-bold px-2 py-0.5 rounded">
                    {reg.categoryName}
                  </span>
                </div>
                {[
                  { icon: <User className="w-3.5 h-3.5" />, label: reg.fullName },
                  { icon: <Mail className="w-3.5 h-3.5" />, label: reg.email },
                  { icon: <Phone className="w-3.5 h-3.5" />, label: reg.phone },
                  { icon: <Shirt className="w-3.5 h-3.5" />, label: `T-Shirt: ${reg.tshirtSize} · Age: ${reg.age}` },
                  { icon: <CreditCard className="w-3.5 h-3.5" />, label: `Txn: ${reg.transactionId || reg.paymentStatus}` },
                  ...(reg.checkedInAt ? [{ icon: <Clock className="w-3.5 h-3.5" />, label: `Check-in: ${new Date(reg.checkedInAt).toLocaleTimeString()}` }] : []),
                  ...(lastResult.firstCheckedInAt ? [{ icon: <Clock className="w-3.5 h-3.5" />, label: `First check-in: ${new Date(lastResult.firstCheckedInAt).toLocaleString()}` }] : [])
                ].map(({ icon, label }, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-300 text-xs">
                    <span className="text-slate-500">{icon}</span>
                    <span>{label}</span>
                  </div>
                ))}
                {reg.emergencyContactName && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs pt-1 border-t border-white/5">
                    <Phone className="w-3.5 h-3.5 text-red-400" />
                    <span>Emergency: {reg.emergencyContactName} · {reg.emergencyContactPhone}</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => { setLastResult(null); debounceRef.current = false; }}
              className="mt-2 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-lg transition-colors"
            >
              SCAN NEXT →
            </button>
          </div>
        )}

        {/* ─── Manual Token Input ────────────────────────────────────────────── */}
        <div className="bg-[#0F1929] border border-white/10 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <QrCode className="w-3.5 h-3.5 text-[#FF7A30]" /> MANUAL TOKEN INPUT
            </p>
            {manualOpen && (
              <button onClick={() => { setManualOpen(false); setLookupResult(null); setLookupNotFound(false); setManualToken(''); }}
                className="text-slate-500 hover:text-white text-xs transition-colors">Close</button>
            )}
          </div>

          {!manualOpen && (
            <button onClick={() => setManualOpen(true)}
              className="w-full text-xs text-slate-400 hover:text-white transition-colors py-1">
              Click to open manual input...
            </button>
          )}

          {manualOpen && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste or type ticket UUID / QR token..."
                  value={manualToken}
                  onChange={e => setManualToken(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
                  className="flex-1 bg-[#060B14] border border-white/10 text-white text-xs px-4 py-3 rounded-lg focus:outline-none focus:border-[#FF7A30] placeholder-slate-600"
                />
                <button onClick={handleManualLookup} disabled={loading || !manualToken.trim()}
                  className="flex items-center gap-1.5 bg-[#FF7A30] text-white text-xs font-bold uppercase px-4 py-3 rounded-lg hover:bg-[#FFB347] disabled:opacity-50 transition-colors">
                  <Search className="w-3.5 h-3.5" /> VERIFY
                </button>
              </div>

              {/* Lookup result */}
              {lookupNotFound && (
                <div className="bg-red-950/60 border border-red-500/30 rounded-xl p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-400 mx-auto mb-1" />
                  <p className="text-red-300 font-bold text-sm">No record found</p>
                  <p className="text-slate-500 text-xs mt-1">No registration matches this identifier.</p>
                </div>
              )}

              {lookupResult && (
                <div className="bg-[#0A1420] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{lookupResult.fullName}</p>
                      <p className="text-slate-400 text-xs">{lookupResult.categoryName} · Bib #{lookupResult.bibNumber || 'N/A'}</p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      lookupResult.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {lookupResult.paymentStatus}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3" /><span>{lookupResult.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3" /><span>{lookupResult.phone}</span></div>
                    {lookupResult.checkedIn && (
                      <div className="flex items-center gap-2 text-amber-400">
                        <Clock className="w-3 h-3" />
                        <span>Already checked in at {lookupResult.checkedInAt ? new Date(lookupResult.checkedInAt).toLocaleString() : 'unknown'}</span>
                      </div>
                    )}
                  </div>

                  {!lookupResult.checkedIn && lookupResult.paymentStatus === 'PAID' && (
                    <button onClick={handleManualCheckIn} disabled={loading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2">
                      {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      CHECK IN THIS RUNNER
                    </button>
                  )}
                  {lookupResult.checkedIn && (
                    <div className="text-amber-400 text-xs text-center font-bold py-2">
                      ⚠ Runner is already checked in
                    </div>
                  )}
                  {lookupResult.paymentStatus !== 'PAID' && (
                    <div className="text-red-400 text-xs text-center font-bold py-2">
                      ✗ Payment not confirmed — cannot check in
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* HTTPS note */}
        <div className="flex items-start gap-2 text-[11px] text-slate-600 bg-[#0F1929] rounded-xl p-3 border border-white/5">
          <Wifi className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500" />
          <span>Camera requires HTTPS or localhost. For phone testing, use ngrok: <code className="text-slate-400">ngrok http 5173</code> and open the ngrok URL on your phone.</span>
        </div>
      </div>
    </div>
  );
};

export default GateScanner;
