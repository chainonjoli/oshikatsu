import "server-only";
import { query, queryOne } from "./db";
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

export function getOshi(userId: string): Promise<Oshi | null> {
  return queryOne<Oshi>(
    "SELECT * FROM oshis WHERE user_id = ? ORDER BY created_at LIMIT 1",
    [userId]
  );
}

export function getEvent(userId: string, eventId: string): Promise<EventRow | null> {
  return queryOne<EventRow>("SELECT * FROM events WHERE id = ? AND user_id = ?", [
    eventId,
    userId,
  ]);
}

export function getEventsInMonth(
  userId: string,
  year: number,
  month: number
): Promise<EventRow[]> {
  const prefix = `${year}-${String(month).padStart(2, "0")}-%`;
  return query<EventRow>(
    "SELECT * FROM events WHERE user_id = ? AND date LIKE ? ORDER BY date, start_time",
    [userId, prefix]
  );
}

export function getUpcomingEvents(userId: string, limit = 5): Promise<EventRow[]> {
  return query<EventRow>(
    "SELECT * FROM events WHERE user_id = ? AND date >= ? ORDER BY date, start_time LIMIT ?",
    [userId, todayJST(), limit]
  );
}

export function getAllEvents(userId: string): Promise<EventRow[]> {
  return query<EventRow>("SELECT * FROM events WHERE user_id = ? ORDER BY date DESC", [
    userId,
  ]);
}

/** 直近◯日以内の期限系予定(警告表示用) */
export function getUpcomingDeadlines(userId: string, withinDays = 7): Promise<EventRow[]> {
  const today = todayJST();
  const limitDate = new Date(Date.parse(`${today}T00:00:00Z`) + withinDays * 86400000)
    .toISOString()
    .slice(0, 10);
  const placeholders = DEADLINE_CATEGORIES.map(() => "?").join(",");
  return query<EventRow>(
    `SELECT * FROM events WHERE user_id = ? AND category IN (${placeholders})
     AND date >= ? AND date <= ? ORDER BY date`,
    [userId, ...DEADLINE_CATEGORIES, today, limitDate]
  );
}

/** 今日のライブ・舞台(当日モードの対象) */
export function getTodayLiveEvents(userId: string): Promise<EventRow[]> {
  const placeholders = LIVE_DAY_CATEGORIES.map(() => "?").join(",");
  return query<EventRow>(
    `SELECT * FROM events WHERE user_id = ? AND date = ? AND category IN (${placeholders})
     ORDER BY start_time`,
    [userId, todayJST(), ...LIVE_DAY_CATEGORIES]
  );
}

/** 今日以降で直近のライブ・舞台(カウントダウン用) */
export function getNextLiveEvent(userId: string): Promise<EventRow | null> {
  const placeholders = LIVE_DAY_CATEGORIES.map(() => "?").join(",");
  return queryOne<EventRow>(
    `SELECT * FROM events WHERE user_id = ? AND date >= ? AND category IN (${placeholders})
     ORDER BY date, start_time LIMIT 1`,
    [userId, todayJST(), ...LIVE_DAY_CATEGORIES]
  );
}

export function getTodayEvents(userId: string): Promise<EventRow[]> {
  return query<EventRow>(
    "SELECT * FROM events WHERE user_id = ? AND date = ? ORDER BY start_time",
    [userId, todayJST()]
  );
}

export function getTrips(userId: string): Promise<Trip[]> {
  return query<Trip>("SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC", [
    userId,
  ]);
}

export function getTrip(userId: string, tripId: string): Promise<Trip | null> {
  return queryOne<Trip>("SELECT * FROM trips WHERE id = ? AND user_id = ?", [tripId, userId]);
}

export function getTripByEvent(userId: string, eventId: string): Promise<Trip | null> {
  return queryOne<Trip>("SELECT * FROM trips WHERE event_id = ? AND user_id = ?", [
    eventId,
    userId,
  ]);
}

export function getChecklists(userId: string): Promise<Checklist[]> {
  return query<Checklist>(
    "SELECT * FROM checklists WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );
}

export function getChecklist(userId: string, id: string): Promise<Checklist | null> {
  return queryOne<Checklist>("SELECT * FROM checklists WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);
}

export function getChecklistByEvent(
  userId: string,
  eventId: string
): Promise<Checklist | null> {
  return queryOne<Checklist>(
    "SELECT * FROM checklists WHERE event_id = ? AND user_id = ? ORDER BY created_at LIMIT 1",
    [eventId, userId]
  );
}

export function getChecklistItems(checklistId: string): Promise<ChecklistItem[]> {
  return query<ChecklistItem>(
    "SELECT * FROM checklist_items WHERE checklist_id = ? ORDER BY sort_order, created_at",
    [checklistId]
  );
}

export async function getChecklistProgress(
  checklistId: string
): Promise<{ done: number; total: number }> {
  const row = await queryOne<{ total: number; done: number | null }>(
    "SELECT COUNT(*) AS total, SUM(checked) AS done FROM checklist_items WHERE checklist_id = ?",
    [checklistId]
  );
  return { done: Number(row?.done ?? 0), total: Number(row?.total ?? 0) };
}

export function getActiveLinks(category?: string): Promise<AffiliateLink[]> {
  if (category) {
    return query<AffiliateLink>(
      "SELECT * FROM affiliate_links WHERE active = 1 AND category = ? ORDER BY sort_order, created_at",
      [category]
    );
  }
  return query<AffiliateLink>(
    "SELECT * FROM affiliate_links WHERE active = 1 ORDER BY sort_order, created_at"
  );
}

export function getAllLinks(): Promise<AffiliateLink[]> {
  return query<AffiliateLink>(
    "SELECT * FROM affiliate_links ORDER BY sort_order, created_at"
  );
}
