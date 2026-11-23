"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  RotateCw,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Undo2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import jsQR from "jsqr";

interface VerificationResult {
  valid: boolean;
  alreadyCheckedIn: boolean;
  checkedInAt: string | null;
  checkedInBy?: string | null;
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
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live session gate stats
  const [sessionHistory, setSessionHistory] = useState<CheckInRecord[]>([]);
  const totalPassesAdmitted = sessionHistory.reduce((sum, item) => sum + item.attendees, 0);

  // Camera state & Universal QR Engine
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [scannedAnimation, setScannedAnimation] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const animationFrameId = useRef<number | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Web Audio sound feedback effects
  const playScanBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }, [soundEnabled]);

  const playSuccessChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Note 1: D5 (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.16);

      // Note 2: A5 (880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {}
  }, [soundEnabled]);

  const playDuplicateAlert = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Warning tone 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      // Warning tone 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(180, ctx.currentTime + 0.18);
      gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.42);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.42);
    } catch {}
  }, [soundEnabled]);

  const playErrorSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  }, [soundEnabled]);

  // Continuous frame scanning loop with jsQR
  const tick = () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (
      video &&
      video.readyState >= 2 &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas");
      }
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data && code.data.trim()) {
          const scannedVal = code.data.trim();
          // Pause scanner while showing result
          isScanningRef.current = false;
          playScanBeep();
          setScannedAnimation(true);
          setTimeout(() => setScannedAnimation(false), 1200);

          verifyTicket(scannedVal);
          return;
        }
      }
    }

    animationFrameId.current = requestAnimationFrame(tick);
  };

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setErrorMsg("Camera access is not supported by this browser.");
        return;
      }

      stopCamera();

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback for laptop webcams without facingMode or resolution support
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraActive(true);
        isScanningRef.current = true;
        animationFrameId.current = requestAnimationFrame(tick);
      }
    } catch (err: any) {
      console.warn("Camera start err:", err);
      setErrorMsg(
        "Could not access device camera. Please grant camera permissions in your browser address bar and try again."
      );
      setCameraActive(false);
      isScanningRef.current = false;
    }
  };

  const stopCamera = () => {
    isScanningRef.current = false;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
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
    }, 250);
  };

  const resumeScanning = useCallback(() => {
    setResult(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    setManualCode("");
    if (cameraActive && videoRef.current) {
      isScanningRef.current = true;
      animationFrameId.current = requestAnimationFrame(tick);
    } else {
      startCamera();
    }
  }, [cameraActive]);

  // Keyboard shortcut: Space or Enter to scan next attendee when result is active
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }
      if ((result || errorMsg) && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        resumeScanning();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [result, errorMsg, resumeScanning]);

  // Verify ticket query (Automatically updates status to checked_in on backend and checks duplicates)
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
        playErrorSound();
        return;
      }

      setResult(data);

      if (data.alreadyCheckedIn) {
        // DUPLICATE ENTRY ALERT: pass was already marked checked in!
        playDuplicateAlert();
      } else {
        // ADMISSION APPROVED: pass verified and status set to checked_in!
        playSuccessChime();
        setSuccessMsg(data.message);

        // Record admission in current gate session history
        const newRecord: CheckInRecord = {
          id: data.registration.id,
          name: data.registration.name,
          ticketCode: data.registration.ticketCode,
          attendees: data.registration.attendees,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        };
        setSessionHistory((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
      }
    } catch {
      setErrorMsg("Network error contacting ticket validation gateway.");
      playErrorSound();
    } finally {
      setLoading(false);
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

      setSuccessMsg("Check-in undone. Pass reactivated and valid again.");

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
        subtitle="Real-time optical scanner & credential check-in engine for Sonic Fest attendees."
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
              <span>AUTO-CHECKIN ACTIVE</span>
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  title={soundEnabled ? "Mute Gate Sounds" : "Enable Gate Sounds"}
                  className={cn(
                    "p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1",
                    soundEnabled
                      ? "text-primary border-primary/30 bg-primary/10"
                      : "text-foreground-muted border-white/10 bg-surface-elevated"
                  )}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

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
                    <div
                      className={cn(
                        "w-52 h-52 border-2 rounded-2xl relative transition-all duration-300",
                        scannedAnimation
                          ? "border-emerald-400 bg-emerald-500/25 shadow-glow"
                          : "border-primary/80 shadow-glow"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4",
                          scannedAnimation ? "border-emerald-400" : "border-primary"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4",
                          scannedAnimation ? "border-emerald-400" : "border-primary"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4",
                          scannedAnimation ? "border-emerald-400" : "border-primary"
                        )}
                      />
                      <div
                        className={cn(
                          "absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4",
                          scannedAnimation ? "border-emerald-400" : "border-primary"
                        )}
                      />
                      {/* Scanning laser line */}
                      {!scannedAnimation && (
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse absolute top-1/2 -translate-y-1/2 shadow-glow" />
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-3 inset-x-0 text-center">
                    <span
                      className={cn(
                        "px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all",
                        scannedAnimation
                          ? "bg-emerald-500 text-black border-emerald-400 font-black animate-pulse"
                          : "bg-black/75 backdrop-blur-md text-primary border-primary/40"
                      )}
                    >
                      {scannedAnimation
                        ? "✓ QR DECODED — VERIFYING"
                        : "Align QR inside target box"}
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resumeScanning}
                  className="flex-1 text-primary border-primary/30 hover:bg-primary/10"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Resume Scanning
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopCamera}
                  className="flex-1 text-red-400 border-red-500/30 hover:bg-red-500/10"
                  leftIcon={<CameraOff className="w-4 h-4" />}
                >
                  Deactivate Camera
                </Button>
              </div>
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
                Verify & Check In
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
                Test Demo Pass (SF-DEMO2025)
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
                    {result.alreadyCheckedIn ? "Already Checked In" : "Admission Approved"}
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

              {successMsg && !result?.alreadyCheckedIn && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-3 mb-6 animate-fade-in">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-sm uppercase">Check-In Synchronized</div>
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
                      Scan an attendee's QR code with the camera or submit a Ticket ID. The system will verify validity, update status to checked in, and flag duplicate entries.
                    </p>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-16 space-y-4">
                  <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                    Checking Festival Database & Recording Entry...
                  </div>
                </div>
              )}

              {/* VALIDATED TICKET DISPLAY */}
              {result && (
                <div className="space-y-6 animate-fade-in">
                  {/* Status Banner */}
                  {result.alreadyCheckedIn ? (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 text-amber-300 flex items-start gap-4 shadow-[0_0_30px_rgba(245,158,11,0.25)] animate-shake">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 border border-amber-500/30">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-black text-base uppercase tracking-wider text-amber-300 flex items-center gap-2">
                          <span>DUPLICATE ENTRY DETECTED!</span>
                          <Badge variant="warning" className="text-[10px] uppercase font-black">DENIED</Badge>
                        </div>
                        <div className="text-xs text-amber-200/90 leading-relaxed">
                          This pass was already checked in at{" "}
                          <strong className="text-white underline">
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
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-300 flex items-start gap-4 shadow-[0_0_30px_rgba(16,185,129,0.25)] animate-fade-in">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 border border-emerald-500/30">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-black text-base uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                          <span>ADMISSION APPROVED — CHECKED IN ✓</span>
                          <Badge variant="success" className="text-[10px] uppercase font-black">VALID</Badge>
                        </div>
                        <div className="text-xs text-emerald-200/90 leading-relaxed">
                          Status updated to <strong>checked_in</strong>. Issue{" "}
                          <strong className="text-white underline">
                            {result.registration.attendees} wristband{result.registration.attendees > 1 ? "s" : ""}
                          </strong>{" "}
                          for {result.registration.name}.
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
                    className="flex-1 text-base font-black shadow-glow bg-emerald-500 hover:bg-emerald-600 text-black border-none"
                    onClick={resumeScanning}
                    leftIcon={<CheckCircle className="w-5 h-5 text-black" />}
                  >
                    Admission Recorded ✓ (Scan Next: Space / Enter)
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 text-base font-black"
                    onClick={resumeScanning}
                    leftIcon={<RefreshCw className="w-5 h-5" />}
                  >
                    Scan Next Pass (Space / Enter)
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="md"
                  className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 shrink-0"
                  onClick={() => handleUndo()}
                  isLoading={actionLoading}
                  leftIcon={<Undo2 className="w-4 h-4" />}
                >
                  Undo Check-In
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
