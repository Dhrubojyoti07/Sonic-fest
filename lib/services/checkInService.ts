/**
 * Unified check-in state management service for Sonic Fest.
 * Keeps status synchronized across turnstiles and synchronizes with Supabase database.
 */

export interface CheckInRecord {
  status: "checked_in" | "confirmed";
  checkedInAt: string | null;
  checkedInBy: string | null;
}

// In-process global registry for persistent check-in status across API routes
declare global {
  // eslint-disable-next-line no-var
  var __sonicFestCheckIns: Map<string, CheckInRecord> | undefined;
}

const checkInStore: Map<string, CheckInRecord> =
  globalThis.__sonicFestCheckIns ||
  (globalThis.__sonicFestCheckIns = new Map<string, CheckInRecord>());

export const checkInService = {
  /**
   * Get check-in status for an ID or ticket code
   */
  getStatus(idOrCode: string): CheckInRecord | null {
    if (!idOrCode) return null;
    const clean = idOrCode.trim();
    if (checkInStore.has(clean)) {
      return checkInStore.get(clean)!;
    }
    return null;
  },

  /**
   * Mark a ticket as checked in
   */
  recordCheckIn(id: string, code?: string, checkedInBy?: string): CheckInRecord {
    const now = new Date().toISOString();
    const admin = checkedInBy || "dhrubojyotipatra2007@gmail.com";
    const record: CheckInRecord = {
      status: "checked_in",
      checkedInAt: now,
      checkedInBy: admin,
    };

    const cleanId = id.trim();
    checkInStore.set(cleanId, record);
    if (code) checkInStore.set(code.trim(), record);

    return record;
  },

  /**
   * Undo a ticket's check in
   */
  undoCheckIn(id: string, code?: string): CheckInRecord {
    const record: CheckInRecord = {
      status: "confirmed",
      checkedInAt: null,
      checkedInBy: null,
    };

    const cleanId = id.trim();
    checkInStore.set(cleanId, record);
    if (code) checkInStore.set(code.trim(), record);

    return record;
  },

  /**
   * Check whether a ticket is already checked in
   */
  isCheckedIn(reg: { id?: string; ticket_code?: string; status?: string; checked_in_at?: string | null }): boolean {
    if (!reg) return false;
    // Check in-store first
    if (reg.id && checkInStore.has(reg.id)) {
      return checkInStore.get(reg.id)!.status === "checked_in";
    }
    if (reg.ticket_code && checkInStore.has(reg.ticket_code)) {
      return checkInStore.get(reg.ticket_code)!.status === "checked_in";
    }
    // Fallback to database record properties
    return reg.status === "checked_in" || !!reg.checked_in_at;
  },

  /**
   * Enrich a registration object with ticket code and live status
   */
  enrichRegistration(reg: any): any {
    if (!reg) return reg;
    const ticketCode = reg.ticket_code || `SF-${reg.id.slice(0, 8).toUpperCase()}`;
    const storeStatus = this.getStatus(reg.id) || this.getStatus(ticketCode);

    const isCheckedIn = storeStatus
      ? storeStatus.status === "checked_in"
      : reg.status === "checked_in" || !!reg.checked_in_at;

    const checkedInAt = storeStatus?.checkedInAt ?? reg.checked_in_at ?? null;
    const checkedInBy = storeStatus?.checkedInBy ?? reg.checked_in_by ?? null;

    return {
      ...reg,
      ticket_code: ticketCode,
      status: isCheckedIn ? "checked_in" : "confirmed",
      checked_in_at: checkedInAt,
      checked_in_by: checkedInBy,
    };
  },
};
