import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  Keyboard,
  ShieldCheck,
  User,
  Ticket as TicketIcon
} from 'lucide-react';
import { ticketsApi } from '../../api/tickets.api';
import { extractErrorMessage } from '../../utils/errors';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function CheckInScanner() {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [manualToken, setManualToken] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [scanResult, setScanResult] = useState(null); // { type: 'success' | 'warning' | 'error', message, ticket }
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);

  const handleProcessToken = async (tokenString) => {
    if (!tokenString || checkingIn) return;

    try {
      setCheckingIn(true);
      setScanResult(null);

      const res = await ticketsApi.checkInTicket(tokenString.trim());
      const checkedTicket = res.data?.ticket;

      setScanResult({
        type: 'success',
        message: 'Ticket Validated Successfully! Attendee admitted.',
        ticket: checkedTicket
      });
      showToast(`Admitted ${checkedTicket?.customerName || 'attendee'} (${checkedTicket?.ticketNumber || ''})`);
      setManualToken('');
    } catch (err) {
      const status = err.response?.status;
      const msg = extractErrorMessage(err, 'Failed to validate ticket');

      if (status === 409) {
        setScanResult({
          type: 'warning',
          message: msg || 'DUPLICATE SCAN: Ticket has already been checked in!'
        });
        showToast('Ticket already scanned earlier (single-use)', 'error');
      } else {
        setScanResult({
          type: 'error',
          message: msg || 'INVALID TICKET: Cryptographic signature mismatch or token not found.'
        });
        showToast('Invalid or forged QR token', 'error');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleProcessToken(manualToken);
  };

  // Setup html5-qrcode scanner when cameraActive is toggled on
  useEffect(() => {
    if (cameraActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          handleProcessToken(decodedText);
          // Optional pause on successful scan
        },
        (error) => {
          // ignore background frame scan errors
        }
      );

      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
        }
      };
    }
  }, [cameraActive]);

  return (
    <div className="max-w-5xl mx-auto space-y-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-white">
            Venue Gate Check-In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Scan attendee QR passes via live camera or validate signed tokens manually.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-mono text-[11px] font-semibold uppercase self-start">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          Single-Use Enforcement Active
        </span>
      </div>

      {/* Validation Result Feedback Banner */}
      {scanResult && (
        <div
          className={`p-6 rounded-2xl border shadow-card ${
            scanResult.type === 'success'
              ? isDark
                ? 'bg-[#0D1A15] border-[#10B981]/45 text-emerald-100'
                : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : scanResult.type === 'warning'
              ? isDark
                ? 'bg-[#1D150A] border-amber-400/45 text-amber-100'
                : 'bg-amber-50 border-amber-300 text-amber-950'
              : isDark
              ? 'bg-[#1C0D10] border-rose-500/45 text-rose-100'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                scanResult.type === 'success'
                  ? 'bg-[#10B981] text-[#060709]'
                  : scanResult.type === 'warning'
                  ? 'bg-amber-400 text-[#060709]'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {scanResult.type === 'success' && <CheckCircle2 className="w-7 h-7" />}
              {scanResult.type === 'warning' && <AlertTriangle className="w-7 h-7" />}
              {scanResult.type === 'error' && <XCircle className="w-7 h-7" />}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-mono text-base font-bold uppercase tracking-wide text-white">
                  {scanResult.type === 'success'
                    ? 'VALIDATED — ADMIT ATTENDEE'
                    : scanResult.type === 'warning'
                    ? 'ENTRY REJECTED (ALREADY USED)'
                    : 'INVALID PASS'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScanResult(null)}
                  className="text-xs border-white/15 bg-white/[0.06]"
                >
                  Clear & Scan Next
                </Button>
              </div>

              <p className="text-xs font-medium text-slate-200">{scanResult.message}</p>

              {scanResult.ticket && (
                <div className="bg-[#090A0E] rounded-xl p-4 mt-3 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="font-mono text-slate-400 font-semibold block uppercase text-[10px]">Attendee</span>
                    <span className="font-bold text-white mt-0.5 block">{scanResult.ticket.customerName}</span>
                  </div>
                  <div>
                    <span className="font-mono text-slate-400 font-semibold block uppercase text-[10px]">Tier</span>
                    <span className="font-bold text-[#10B981] mt-0.5 block">{scanResult.ticket.tierName}</span>
                  </div>
                  <div>
                    <span className="font-mono text-slate-400 font-semibold block uppercase text-[10px]">Ticket #</span>
                    <span className="font-mono font-medium text-slate-200 mt-0.5 block">{scanResult.ticket.ticketNumber}</span>
                  </div>
                  <div>
                    <span className="font-mono text-slate-400 font-semibold block uppercase text-[10px]">Status</span>
                    <span className="font-mono font-bold text-[#10B981] mt-0.5 block">CHECKED IN</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two Column Workstation: Camera on Left, Manual Input on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Camera Scanner */}
        <div className="md:col-span-7">
          <Card className="p-6 border-white/10 bg-[#12151E] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#FF4D2D]" />
                Live Camera Scanner
              </h3>
              <Button
                variant={cameraActive ? 'danger' : 'primary'}
                size="sm"
                onClick={() => setCameraActive(!cameraActive)}
                className="text-xs"
              >
                {cameraActive ? 'Turn Off Camera' : 'Activate Camera'}
              </Button>
            </div>

            {cameraActive ? (
              <div className="space-y-3">
                <div
                  id="qr-reader-container"
                  className="rounded-xl overflow-hidden border border-[#FF4D2D]/40 bg-[#060709] min-h-[300px]"
                />
                <p className="text-center font-mono text-[11px] text-[#10B981]">
                  Align attendee QR code inside the camera frame
                </p>
              </div>
            ) : (
              <div className="relative text-center py-16 bg-[#07080B] rounded-xl border border-white/10 space-y-4 overflow-hidden">
                {/* Viewfinder reticle corners matching Check-In preview */}
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                  <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FF4D2D]" />
                  <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FF4D2D]" />
                  <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FF4D2D]" />
                  <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FF4D2D]" />
                  <ScanLine className="w-8 h-8 text-[#10B981]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Camera is Inactive</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Activate camera to scan attendee QR passes at the gate.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setCameraActive(true)}>
                  Activate Camera
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Manual Token Entry Fallback */}
        <div className="md:col-span-5">
          <Card className="p-6 border-white/10 bg-[#12151E] space-y-5">
            <div className="border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-slate-400" />
                Manual Token Fallback
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paste or type token string if camera cannot scan.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[11px] font-semibold uppercase text-slate-300 mb-1.5">
                  Signed QR Token String
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste raw signed QR token here..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full bg-[#090A0E] border border-white/15 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#FF4D2D]"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={checkingIn}
                disabled={!manualToken || checkingIn}
                className="w-full rounded-xl text-xs"
              >
                Validate Entry
              </Button>
            </form>

            <div className="pt-2 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Strict HMAC single-use verification enforced.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
