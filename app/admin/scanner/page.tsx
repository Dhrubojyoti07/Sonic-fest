"use client";

import React, { useState, useEffect, useRef } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  QrCode,
  Camera,
  CameraOff,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Users,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  RotateCw,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface VerificationResult {
  valid: boolean;
  alreadyCheckedIn: boolean;
  checkedInAt: string | null;
  registration: {
    id: string;
    ticketCode: string;
    name: string;
    email: string;
    phone: string;
    attendees: number;
    status: string;
    createdAt?: string;
  };
  event: {
    title: string;
    date?: string;
    venue: string;
    location: string;
  };
}

interface CheckInRecord {
  id: string;
  name: string;
  ticketCode: string;
  attendees: number;
  time: string;
}

export default function AdminScannerPage() {
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live session gate stats
  const [sessionHistory, setSessionHistory] = useState<CheckInRecord[]>([]);
  const totalPassesAdmitted = sessionHistory.reduce((sum, item) => sum + item.attendees, 0);

  // Camera state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanIntervalRef = useRef<any>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setErrorMsg("Camera access is not supported by this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);

        // Start scanning frames with native BarcodeDetector if supported
        if (typeof window !== "undefined" && "BarcodeDetector" in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
          scanIntervalRef.current = setInterval(async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const scannedVal = barcodes[0].rawValue;
                  if (scannedVal) {
                    stopCamera();
                    verifyTicket(scannedVal);
                  }
                }
              } catch {
                // frame detect catch
              }
            }
          }, 350);
        }
      }
    } catch (err: any) {
      console.warn("Camera start err:", err);
      setErrorMsg("Could not access device camera. Please check camera permissions.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = async () => {
    stopCamera();
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Verify ticket query
  const verifyTicket = async (queryVal: string) => {
    const clean = queryVal.trim();
    if (!clean) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setResult(null);

    try {
      const res = await fetch(`/api/tickets/verify?query=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Ticket verification failed. Pass not recognized.");
        return;
      }

      setResult(data);
    } catch {
      setErrorMsg("Network error contacting ticket validation gateway.");
    } finally {
      setLoading(false);
    }
  };

  // Check In action
  const handleCheckIn = async () => {
    if (!result?.registration?.id) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.registration.id, action: "check_in" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to check in ticket.");
        return;
      }

      setSuccessMsg(data.message);

      // Update current result state to checked in
      setResult((prev) =>
        prev
          ? {
              ...prev,
              alreadyCheckedIn: true,
              checkedInAt: data.checkedInAt || new Date().toISOString(),
              registration: {
                ...prev.registration,
                status: "checked_in",
              },
            }
          : null
      );

      // Add to session roster
      const newRecord: CheckInRecord = {
        id: result.registration.id,
        name: result.registration.name,
        ticketCode: result.registration.ticketCode,
        attendees: result.registration.attendees,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
      setSessionHistory((prev) => [newRecord, ...prev]);
    } catch {
      setErrorMsg("Check-in execution error. Please retry.");
    } finally {
      setActionLoading(false);
    }
  };

  // Undo Check In action
  const handleUndo = async (recordId?: string) => {
    const targetId = recordId || result?.registration?.id;
    if (!targetId) return;

    setActionLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: targetId, action: "undo" }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || "Failed to undo check-in.");
        return;
      }

      setSuccessMsg("Check-in has been undone. Ticket is valid again.");

      if (result && result.registration.id === targetId) {
        setResult((prev) =>
          prev
            ? {
                ...prev,
                alreadyCheckedIn: false,
                checkedInAt: null,
                registration: {
                  ...prev.registration,
                  status: "confirmed",
                },
              }
            : null
        );
      }

      setSessionHistory((prev) => prev.filter((item) => item.id !== targetId));
    } catch {
      setErrorMsg("Failed to undo check-in.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <AdminHeader
        title="Turnstile QR Scanner & Gate Check-In"
        subtitle="Live camera scanner and credential validation engine for festival attendees."
      />

      {/* Top Gate Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-foreground-muted">
              Admissions This Session
            </div>
            <div className="text-2xl font-black text-white">{sessionHistory.length} Attendees</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-purple/20 text-accent-purple flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-foreground-muted">
              Total Wristbands Issued
            </div>
            <div className="text-2xl font-black text-white">{totalPassesAdmitted} Passes</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface-subtle border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-foreground-muted">
              Gate Turnstile Link
            </div>
            <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE & SYNCHRONIZED</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Interface: Camera / Input on Left, Validation Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scanner & Manual Lookup */}
        <div className="lg:col-span-6 space-y-6">
          {/* Camera Viewport Container */}
          <div className="p-6 rounded-3xl bg-surface-subtle border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold uppercase tracking-wider text-white">
                  Optical QR Scanner
                </h2>
              </div>

              {cameraActive && (
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="text-xs text-foreground-muted hover:text-white flex items-center gap-1 py-1 px-2.5 rounded-lg bg-surface-elevated border border-white/10"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Flip Camera</span>
                </button>
              )}
            </div>

            {/* Video Box */}
            <div className="relative aspect-video rounded-2xl bg-black border border-white/15 overflow-hidden flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                playsInline
                muted
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-300",
                  cameraActive ? "opacity-100" : "opacity-0 absolute pointer-events-none"
                )}
              />

              {cameraActive && (
                <>
                  {/* Holographic targeting reticle */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-primary/80 rounded-2xl relative shadow-glow">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-primary" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-primary" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-primary" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-primary" />
                      {/* Scanning laser animation line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-glow" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 inset-x-0 text-center">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold uppercase tracking-widest text-primary border border-primary/30">
                      Align QR inside target box
                    </span>
                  </div>
                </>
              )}

              {!cameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-white/10 text-foreground-muted flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-white tracking-wider">
                      Turnstile Camera Offline
                    </h3>
                    <p className="text-xs text-foreground-muted max-w-xs mx-auto mt-1">
                      Start optical camera to scan wristband passes automatically, or enter the code manually below.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={startCamera}
                    leftIcon={<Camera className="w-4 h-4" />}
                  >
                    Activate Camera Scanner
                  </Button>
                </div>
              )}
            </div>

            {cameraActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={stopCamera}
                className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10"
                leftIcon={<CameraOff className="w-4 h-4" />}
              >
                Deactivate Camera
              </Button>
            )}
          </div>

          {/* Manual Input / Barcode Scanner Input */}
          <div className="p-6 rounded-3xl bg-surface-subtle border border-white/10 shadow-xl space-y-4">
            <h2 className="text-base font-bold uppercase tracking-wider text-white">
              Manual Code Lookup / Barcode Gun
            </h2>
            <p className="text-xs text-foreground-muted">
              Type or paste ticket ID (e.g. <code className="text-primary font-bold">SF-A8F29C</code>), or scan using a handheld USB barcode scanner.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyTicket(manualCode);
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-foreground-dark absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Enter Ticket ID (e.g. SF-XXXXXX or URL)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-white text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                disabled={!manualCode.trim()}
              >
                Verify
              </Button>
            </form>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-foreground-dark">Test with preview credential:</span>
              <button
                type="button"
                onClick={() => {
                  setManualCode("SF-DEMO2025");
                  verifyTicket("SF-DEMO2025");
                }}
                className="text-primary hover:underline font-mono font-bold"
              >
                Load Demo (SF-DEMO2025)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Ticket Validation Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-surface-subtle border border-white/10 shadow-2xl min-h-[460px] flex flex-col justify-between relative overflow-hidden">
            {/* Ambient subtle glow based on status */}
            {result && !result.alreadyCheckedIn && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[90px] pointer-events-none" />
            )}
            {result && result.alreadyCheckedIn && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-[90px] pointer-events-none" />
            )}
            {errorMsg && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/15 rounded-full blur-[90px] pointer-events-none" />
            )}

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <span className="text-xs uppercase font-extrabold tracking-widest text-foreground-muted">
                  Gate Credential Verification
                </span>
                {result && (
                  <Badge variant={result.alreadyCheckedIn ? "warning" : "success"}>
                    {result.alreadyCheckedIn ? "Checked In" : "Valid"}
                  </Badge>
                )}
              </div>

              {/* Feedback Notifications */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-3 mb-6 animate-shake">
                  <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm uppercase">Verification Alert</div>
                    <div className="mt-1 leading-relaxed">{errorMsg}</div>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3 mb-6 animate-fade-in">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm uppercase">Success</div>
                    <div className="mt-1 leading-relaxed">{successMsg}</div>
                  </div>
                </div>
              )}

              {/* Idle State: Waiting for scan */}
              {!loading && !result && !errorMsg && (
                <div className="text-center py-16 space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-surface-elevated border border-white/10 text-foreground-dark flex items-center justify-center mx-auto">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold uppercase text-white tracking-wider">
                      Turnstile Standby Mode
                    </h3>
                    <p className="text-xs text-foreground-muted max-w-sm mx-auto mt-1 leading-relaxed">
                      Scan an attendee's QR code with the camera or submit a Ticket ID to check admission validity.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-16 space-y-4">
                  <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Checking Festival Database...
                  </div>
                </div>
              )}

              {/* VALIDATED TICKET DISPLAY */}
              {result && (
                <div className="space-y-6 animate-fade-in">
                  {/* Status Banner */}
                  {result.alreadyCheckedIn ? (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <div className="font-black text-sm uppercase tracking-wide">
                          DUPLICATE ENTRY DETECTED!
                        </div>
                        <div className="text-xs text-amber-200 mt-1">
                          This ticket was already checked in at{" "}
                          <strong>
                            {result.checkedInAt
                              ? new Date(result.checkedInAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })
                              : "an earlier time"}
                          </strong>
                          . Prevent duplicate gate pass issuance.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-start gap-3 shadow-glow">
                      <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <div className="font-black text-sm uppercase tracking-wide">
                          TICKET VALID — ADMISSION APPROVED
                        </div>
                        <div className="text-xs text-emerald-200 mt-1">
                          Pass verified. Authorized to issue RFID wristbands.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Attendee Details Card */}
                  <div className="p-5 rounded-2xl bg-surface-elevated border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-foreground-muted">
                          Pass Reference
                        </span>
                        <div className="font-mono text-lg font-black text-primary">
                          {result.registration.ticketCode}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-foreground-muted">
                          Wristbands Needed
                        </span>
                        <div className="text-xl font-black text-white">
                          {result.registration.attendees} Pass{result.registration.attendees > 1 ? "es" : ""}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-foreground-muted block text-[11px]">Primary Holder</span>
                        <span className="font-bold text-white text-sm">{result.registration.name}</span>
                      </div>
                      <div>
                        <span className="text-foreground-muted block text-[11px]">Email</span>
                        <span className="font-medium text-white truncate block">{result.registration.email}</span>
                      </div>
                      <div>
                        <span className="text-foreground-muted block text-[11px]">Contact Phone</span>
                        <span className="font-medium text-white">{result.registration.phone || "Not provided"}</span>
                      </div>
                      <div>
                        <span className="text-foreground-muted block text-[11px]">Event Target</span>
                        <span className="font-semibold text-white truncate block">{result.event.title}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Decision Actions */}
            {result && (
              <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
                {!result.alreadyCheckedIn ? (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full text-base font-black shadow-glow"
                    onClick={handleCheckIn}
                    isLoading={actionLoading}
                    leftIcon={<CheckCircle className="w-5 h-5 text-white" />}
                  >
                    Confirm & Check In Attendee
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
                    onClick={() => handleUndo()}
                    isLoading={actionLoading}
                    leftIcon={<Undo2 className="w-4 h-4" />}
                  >
                    Undo Check-In (Reactivate Pass)
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setResult(null);
                    setManualCode("");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                >
                  Clear Screen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Gate Session Activity History */}
      {sessionHistory.length > 0 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-subtle border border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Recent Admissions At This Gate</span>
            </h3>
            <span className="text-xs text-foreground-muted">
              {sessionHistory.length} Total Check-Ins
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-foreground-muted uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Attendee Name</th>
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Wristbands</th>
                  <th className="py-3 px-4 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sessionHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-foreground-muted">{item.time}</td>
                    <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-primary font-semibold">{item.ticketCode}</td>
                    <td className="py-3 px-4">
                      <Badge variant="purple">{item.attendees} Pass{item.attendees > 1 ? "es" : ""}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleUndo(item.id)}
                        className="text-[11px] text-foreground-muted hover:text-amber-400 underline font-medium"
                      >
                        Undo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
