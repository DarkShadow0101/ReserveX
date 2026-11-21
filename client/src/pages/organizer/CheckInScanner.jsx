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
import { formatEventDate } from '../../utils/date';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function CheckInScanner() {
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
      setManualToken('');
    } catch (err) {
      const status = err.response?.status;
      const msg = extractErrorMessage(err, 'Failed to validate ticket');

      if (status === 409) {
        setScanResult({
          type: 'warning',
          message: msg || 'DUPLICATE SCAN: Ticket has already been checked in!'
        });
      } else {
        setScanResult({
          type: 'error',
          message: msg || 'INVALID TICKET: Cryptographic signature mismatch or token not found.'
        });
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-purple">
          Gate Control & Admission
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
          Attendee Check-In Station
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Scan attendee QR passes using live camera or enter cryptographically signed tokens manually.
        </p>
      </div>

      {/* Validation Result Feedback Banner */}
      {scanResult && (
        <div
          className={`p-6 rounded-3xl border shadow-lg animate-in fade-in zoom-in-95 duration-200 ${
            scanResult.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900'
              : scanResult.type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-900'
              : 'bg-rose-500/10 border-rose-500/40 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                scanResult.type === 'success'
                  ? 'bg-emerald-500 text-white'
                  : scanResult.type === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {scanResult.type === 'success' && <CheckCircle2 className="w-7 h-7" />}
              {scanResult.type === 'warning' && <AlertTriangle className="w-7 h-7" />}
              {scanResult.type === 'error' && <XCircle className="w-7 h-7" />}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {scanResult.type === 'success'
                    ? 'ADMIT ATTENDEE'
                    : scanResult.type === 'warning'
                    ? 'ENTRY REJECTED (ALREADY USED)'
                    : 'INVALID PASS'}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScanResult(null)}
                  className="bg-white text-xs"
                >
                  Clear & Scan Next
                </Button>
              </div>

              <p className="text-xs font-semibold">{scanResult.message}</p>

              {scanResult.ticket && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mt-3 border border-emerald-200/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Attendee</span>
                    <span className="font-bold text-slate-900">{scanResult.ticket.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Tier</span>
                    <span className="font-bold text-brand-purple">{scanResult.ticket.tierName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Ticket #</span>
                    <span className="font-mono font-medium text-slate-800">{scanResult.ticket.ticketNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Status</span>
                    <span className="font-extrabold text-emerald-600">USED (CHECKED-IN)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two Column Workstation: Camera on Left, Manual Input on Right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left: Camera Scanner */}
        <div className="md:col-span-7">
          <Card className="p-6 border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-brand-purple" />
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
                  className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 min-h-[300px]"
                />
                <p className="text-center text-[11px] text-slate-400">
                  Align attendee QR code inside the green scanner frame.
                </p>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-purple flex items-center justify-center mx-auto">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Camera is Inactive</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Click Activate Camera to start scanning attendee passes via webcam or mobile camera.
                </p>
                <Button variant="primary" size="sm" onClick={() => setCameraActive(true)}>
                  Activate Camera
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Manual Token Entry Fallback */}
        <div className="md:col-span-5">
          <Card className="p-6 border-slate-100 shadow-soft space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-slate-500" />
                Manual Token Fallback
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paste or type token string if camera cannot scan or print is damaged.
              </p>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Signed QR Token String
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste raw base64url signed QR token here..."
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:border-brand-purple"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={checkingIn}
                disabled={!manualToken || checkingIn}
                className="w-full rounded-2xl shadow-sm text-xs"
              >
                Validate & Check In Pass
              </Button>
            </form>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Strict HMAC single-use verification enforced.</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
