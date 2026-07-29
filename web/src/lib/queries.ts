import "server-only";
import { getDb } from "./db";
import { DEADLINE_CATEGORIES, LIVE_DAY_CATEGORIES } from "./constants";
import { todayJST } from "./dates";
import type {
  AffiliateLink,
  Checklist,
  ChecklistItem,
  EventRow,
  Oshi,
  Trip,
} from "./types";

export function getOshi(userId: string): Oshi | null {
  const row = getDb()
    .prepare("SELECT * FROM oshis WHERE user_id = ? ORDER BY created_at LIMIT 1")
    .get(userId) as Oshi | undefined;
  return row ?? null;
}

export function getEvent(userId: string, eventId: string): EventRow | null {
  const row = getDb()
    .prepare("SELECT * FROM events WHERE id = ? AND user_id = ?")
    .get(eventId, userId) as EventRow | undefined;
  return row ?? null;
}

export function getEventsInMonth(userId: string, year: number, month: number): EventRow[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}-%`;
  return getDb()
    .prepare(
      "SELECT * FROM events WHERE user_id = ? AND date LIKE ? ORDER BY date, start_time"
    )
    .all(userId, prefix) as EventRow[];
}

export function getUpcomingEvents(userId: string, limit = 5): EventRow[] {
  return getDb()
    .prepare(
      "SELECT * FROM events WHERE user_id = ? AND date >= ? ORDER BY date, start_time LIMIT ?"
    )
    .all(userId, todayJST(), limit) as EventRow[];
}

export function getAllEvents(userId: string): EventRow[] {
  return getDb()
    .prepare("SELECT * FROM events WHERE user_id = ? ORDER BY date DESC")
    .all(userId) as EventRow[];
}

/** 直近◯日以内の期限系予定(警告表示用) */
export function getUpcomingDeadlines(userId: string, withinDays = 7): EventRow[] {
  const today = todayJST();
  const limitDate = new Date(Date.parse(`${today}T00:00:00Z`) + withinDays * 86400000)
    .toISOString()
    .slice(0, 10);
  const placeholders = DEADLINE_CATEGORIES.map(() => "?").join(",");
  return getDb()
    .prepare(
      `SELECT * FROM events WHERE user_id = ? AND category IN (${placeholders})
       AND date >= ? AND date <= ? ORDER BY date`
    )
    .all(userId, ...DEADLINE_CATEGORIES, today, limitDate) as EventRow[];
}

/** 今日のライブ・舞台(当日モードの対象) */
export function getTodayLiveEvents(userId: string): EventRow[] {
  const placeholders = LIVE_DAY_CATEGORIES.map(() => "?").join(",");
  return getDb()
    .prepare(
      `SELECT * FROM events WHERE user_id = ? AND date = ? AND category IN (${placeholders})
       ORDER BY start_time`
    )
    .all(userId, todayJST(), ...LIVE_DAY_CATEGORIES) as EventRow[];
}

/** 今日以降で直近のライブ・舞台(カウントダウン用) */
export function getNextLiveEvent(userId: string): EventRow | null {
  const placeholders = LIVE_DAY_CATEGORIES.map(() => "?").join(",");
  const row = getDb()
    .prepare(
      `SELECT * FROM events WHERE user_id = ? AND date >= ? AND category IN (${placeholders})
       ORDER BY date, start_time LIMIT 1`
    )
    .get(userId, todayJST(), ...LIVE_DAY_CATEGORIES) as EventRow | undefined;
  return row ?? null;
}

export function getTodayEvents(userId: string): EventRow[] {
  return getDb()
    .prepare("SELECT * FROM events WHERE user_id = ? AND date = ? ORDER BY start_time")
    .all(userId, todayJST()) as EventRow[];
}

export function getTrips(userId: string): Trip[] {
  return getDb()
    .prepare("SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Trip[];
}

export function getTrip(userId: string, tripId: string): Trip | null {
  const row = getDb()
    .prepare("SELECT * FROM trips WHERE id = ? AND user_id = ?")
    .get(tripId, userId) as Trip | undefined;
  return row ?? null;
}

export function getTripByEvent(userId: string, eventId: string): Trip | null {
  const row = getDb()
    .prepare("SELECT * FROM trips WHERE event_id = ? AND user_id = ?")
    .get(eventId, userId) as Trip | undefined;
  return row ?? null;
}

export function getChecklists(userId: string): Checklist[] {
  return getDb()
    .prepare("SELECT * FROM checklists WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as Checklist[];
}

export function getChecklist(userId: string, id: string): Checklist | null {
  const row = getDb()
    .prepare("SELECT * FROM checklists WHERE id = ? AND user_id = ?")
    .get(id, userId) as Checklist | undefined;
  return row ?? null;
}

export function getChecklistByEvent(userId: string, eventId: string): Checklist | null {
  const row = getDb()
    .prepare(
      "SELECT * FROM checklists WHERE event_id = ? AND user_id = ? ORDER BY created_at LIMIT 1"
    )
    .get(eventId, userId) as Checklist | undefined;
  return row ?? null;
}

export function getChecklistItems(checklistId: string): ChecklistItem[] {
  return getDb()
    .prepare("SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY sort_order, created_at")
    .all(checklistId) as ChecklistItem[];
}

export function getChecklistProgress(checklistId: string): { done: number; total: number } {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS total, SUM(checked) AS done FROM checklist_items WHERE checklist_id = ?"
    )
    .get(checklistId) as { total: number; done: number | null };
  return { done: row.done ?? 0, total: row.total };
}

export function getActiveLinks(category?: string): AffiliateLink[] {
  if (category) {
    return getDb()
      .prepare(
        "SELECT * FROM affiliate_links WHERE active = 1 AND category = ? ORDER BY sort_order, created_at"
      )
      .all(category) as AffiliateLink[];
  }
  return getDb()
    .prepare("SELECT * FROM affiliate_links WHERE active = 1 ORDER BY sort_order, created_at")
    .all() as AffiliateLink[];
}

export function getAllLinks(): AffiliateLink[] {
  return getDb()
    .prepare("SELECT * FROM affiliate_links ORDER BY sort_order, created_at")
    .all() as AffiliateLink[];
}
