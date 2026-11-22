-- =============================================================================
-- Migration 002: Ticket Code, QR Verification and Gate Check-In Support
-- =============================================================================

-- Add ticket verification and gate check-in columns to registrations
ALTER TABLE public.registrations
ADD COLUMN IF NOT EXISTS ticket_code TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed',
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_in_by TEXT;

-- Generate ticket codes for any existing registrations
UPDATE public.registrations
SET ticket_code = 'SF-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE ticket_code IS NULL;

-- Create indexes for ultra-fast gate QR code scanning & lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrations_ticket_code ON public.registrations(ticket_code);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
