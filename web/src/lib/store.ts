"use client";

// ブラウザ内(localStorage)にすべてのデータを保存するストア。
// サーバー・データベース不要で GitHub Pages などの静的ホスティングで動く。

import { useSyncExternalStore } from "react";
import { CHECKLIST_TEMPLATE, DEADLINE_CATEGORIES, LIVE_DAY_CATEGORIES } from "./constants";
import { todayJST } from "./dates";
import type { Checklist, ChecklistItem, EventRow, InfoSource, Oshi, Trip } from "./types";

const KEY = "oshikatsu_data_v1";

export type AppData = {
  oshi: Oshi | null;
  events: EventRow[];
  trips: Trip[];
  checklists: Checklist[];
  items: ChecklistItem[];
  /** ユーザーが自分で登録した情報源リンク */
  sources: InfoSource[];
  /** 情報源ID → 最後にチェックした日(YYYY-MM-DD) */
  checks: Record<string, string>;
};

const EMPTY: AppData = {
  oshi: null,
  events: [],
  trips: [],
  checklists: [],
  items: [],
  sources: [],
  checks: {},
};

let cache: AppData | null = null;
const listeners = new Set<() => void>();

function nowISO(): string {
  return new Date().toISOString();
}

function newId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitize(raw: unknown): AppData {
  const d = (raw ?? {}) as Partial<AppData>;
  return {
    oshi: d.oshi ?? null,
    events: Array.isArray(d.events) ? d.events : [],
    trips: Array.isArray(d.trips) ? d.trips : [],
    checklists: Array.isArray(d.checklists) ? d.checklists : [],
    items: Array.isArray(d.items) ? d.items : [],
    // 旧バージョンのバックアップには存在しないため、無い場合は空で補う
    sources: Array.isArray(d.sources) ? d.sources : [],
    checks: d.checks && typeof d.checks === "object" ? d.checks : {},
  };
}

function load(): AppData {
  if (cache) return cache;
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? sanitize(JSON.parse(raw)) : { ...EMPTY };
  } catch {
    cache = { ...EMPTY };
  }
  return cache;
}

function persist(next: AppData): void {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 保存失敗(容量超過など)でもアプリは動作継続
  }
  listeners.forEach((fn) => fn());
}

function mutate(fn: (d: AppData) => AppData): void {
  persist(fn(load()));
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** React から購読するためのフック */
export function useAppData(): AppData {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

// ---------- 推し ----------

export function saveOshi(input: {
  group_name: string;
  member_name: string;
  color: string;
  fan_since: string | null;
  memo: string;
}): void {
  mutate((d) => {
    const now = nowISO();
    const oshi: Oshi = d.oshi
      ? { ...d.oshi, ...input, updated_at: now }
      : { id: newId(), genre: "idol", ...input, created_at: now, updated_at: now };
    return { ...d, oshi };
  });
}

// ---------- 予定 ----------

export type EventInput = Omit<EventRow, "id" | "created_at" | "updated_at">;

export function addEvent(input: EventInput): string {
  const id = newId();
  mutate((d) => {
    const now = nowISO();
    return { ...d, events: [...d.events, { ...input, id, created_at: now, updated_at: now }] };
  });
  return id;
}

/** 貼り付け一括登録用。まとめて追加する */
export function addEvents(inputs: EventInput[]): number {
  if (inputs.length === 0) return 0;
  mutate((d) => {
    const now = nowISO();
    const added = inputs.map((input) => ({
      ...input,
      id: newId(),
      created_at: now,
      updated_at: now,
    }));
    return { ...d, events: [...d.events, ...added] };
  });
  return inputs.length;
}

export function updateEvent(id: string, input: EventInput): void {
  mutate((d) => ({
    ...d,
    events: d.events.map((e) => (e.id === id ? { ...e, ...input, updated_at: nowISO() } : e)),
  }));
}

export function deleteEvent(id: string): void {
  mutate((d) => ({
    ...d,
    events: d.events.filter((e) => e.id !== id),
    trips: d.trips.map((t) => (t.event_id === id ? { ...t, event_id: null } : t)),
    checklists: d.checklists.map((c) => (c.event_id === id ? { ...c, event_id: null } : c)),
  }));
}

// ---------- 遠征プラン ----------

export type TripInput = Omit<Trip, "id" | "created_at" | "updated_at">;

export function addTrip(input: TripInput): string {
  const id = newId();
  mutate((d) => {
    const now = nowISO();
    const trips = input.event_id
      ? d.trips.map((t) => (t.event_id === input.event_id ? { ...t, event_id: null } : t))
      : d.trips;
    return { ...d, trips: [...trips, { ...input, id, created_at: now, updated_at: now }] };
  });
  return id;
}

export function updateTrip(id: string, input: TripInput): void {
  mutate((d) => {
    const trips = input.event_id
      ? d.trips.map((t) =>
          t.id !== id && t.event_id === input.event_id ? { ...t, event_id: null } : t
        )
      : d.trips;
    return {
      ...d,
      trips: trips.map((t) => (t.id === id ? { ...t, ...input, updated_at: nowISO() } : t)),
    };
  });
}

export function deleteTrip(id: string): void {
  mutate((d) => ({ ...d, trips: d.trips.filter((t) => t.id !== id) }));
}

// ---------- 持ち物リスト ----------

export function addChecklist(title: string, eventId: string | null, useTemplate: boolean): string {
  const id = newId();
  mutate((d) => {
    const now = nowISO();
    const list: Checklist = {
      id,
      event_id: eventId,
      title,
      created_at: now,
      updated_at: now,
    };
    const items: ChecklistItem[] = useTemplate
      ? CHECKLIST_TEMPLATE.map((name, i) => ({
          id: newId(),
          checklist_id: id,
          name,
          checked: 0,
          sort_order: i,
          created_at: now,
          updated_at: now,
        }))
      : [];
    return { ...d, checklists: [...d.checklists, list], items: [...d.items, ...items] };
  });
  return id;
}

/** 標準セットのうち、まだ入っていない項目だけ追加 */
export function addTemplateItems(checklistId: string): void {
  mutate((d) => {
    const now = nowISO();
    const existing = new Set(
      d.items.filter((i) => i.checklist_id === checklistId).map((i) => i.name)
    );
    const maxOrder = Math.max(
      -1,
      ...d.items.filter((i) => i.checklist_id === checklistId).map((i) => i.sort_order)
    );
    let order = maxOrder + 1;
    const added: ChecklistItem[] = CHECKLIST_TEMPLATE.filter((n) => !existing.has(n)).map(
      (name) => ({
        id: newId(),
        checklist_id: checklistId,
        name,
        checked: 0,
        sort_order: order++,
        created_at: now,
        updated_at: now,
      })
    );
    return { ...d, items: [...d.items, ...added] };
  });
}

export function addItem(checklistId: string, name: string): void {
  mutate((d) => {
    const now = nowISO();
    const maxOrder = Math.max(
      -1,
      ...d.items.filter((i) => i.checklist_id === checklistId).map((i) => i.sort_order)
    );
    return {
      ...d,
      items: [
        ...d.items,
        {
          id: newId(),
          checklist_id: checklistId,
          name,
          checked: 0,
          sort_order: maxOrder + 1,
          created_at: now,
          updated_at: now,
        },
      ],
    };
  });
}

export function toggleItem(itemId: string): void {
  mutate((d) => ({
    ...d,
    items: d.items.map((i) =>
      i.id === itemId ? { ...i, checked: i.checked ? 0 : 1, updated_at: nowISO() } : i
    ),
  }));
}

export function renameItem(itemId: string, name: string): void {
  mutate((d) => ({
    ...d,
    items: d.items.map((i) => (i.id === itemId ? { ...i, name, updated_at: nowISO() } : i)),
  }));
}

export function deleteItem(itemId: string): void {
  mutate((d) => ({ ...d, items: d.items.filter((i) => i.id !== itemId) }));
}

export function deleteChecklist(checklistId: string): void {
  mutate((d) => ({
    ...d,
    checklists: d.checklists.filter((c) => c.id !== checklistId),
    items: d.items.filter((i) => i.checklist_id !== checklistId),
  }));
}

// ---------- 情報源リンク ----------

export function addSource(label: string, url: string, note: string): void {
  mutate((d) => ({
    ...d,
    sources: [...d.sources, { id: newId(), label, url, note }],
  }));
}

export function updateSource(id: string, label: string, url: string, note: string): void {
  mutate((d) => ({
    ...d,
    sources: d.sources.map((s) => (s.id === id ? { ...s, label, url, note } : s)),
  }));
}

export function deleteSource(id: string): void {
  mutate((d) => {
    const checks = { ...d.checks };
    delete checks[id];
    return { ...d, sources: d.sources.filter((s) => s.id !== id), checks };
  });
}

/** 「チェックした」を記録(日付のみ保存) */
export function markChecked(sourceId: string, date: string): void {
  mutate((d) => ({ ...d, checks: { ...d.checks, [sourceId]: date } }));
}

// ---------- バックアップ ----------

export function exportData(): string {
  return JSON.stringify(load(), null, 2);
}

export function importData(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return false;
    persist(sanitize(parsed));
    return true;
  } catch {
    return false;
  }
}

export function clearAllData(): void {
  persist({ ...EMPTY });
}

// ---------- セレクタ(純関数) ----------

export function eventById(d: AppData, id: string): EventRow | null {
  return d.events.find((e) => e.id === id) ?? null;
}

export function tripById(d: AppData, id: string): Trip | null {
  return d.trips.find((t) => t.id === id) ?? null;
}

export function tripByEvent(d: AppData, eventId: string): Trip | null {
  return d.trips.find((t) => t.event_id === eventId) ?? null;
}

export function checklistById(d: AppData, id: string): Checklist | null {
  return d.checklists.find((c) => c.id === id) ?? null;
}

export function checklistByEvent(d: AppData, eventId: string): Checklist | null {
  return d.checklists.find((c) => c.event_id === eventId) ?? null;
}

export function itemsOf(d: AppData, checklistId: string): ChecklistItem[] {
  return d.items
    .filter((i) => i.checklist_id === checklistId)
    .sort((a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at));
}

function byDateTime(a: EventRow, b: EventRow): number {
  return a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time);
}

export function eventsInMonth(d: AppData, year: number, month: number): EventRow[] {
  const prefix = `${year}-${String(month).padStart(2, "0")}-`;
  return d.events.filter((e) => e.date.startsWith(prefix)).sort(byDateTime);
}

export function upcomingEvents(d: AppData, limit: number): EventRow[] {
  const today = todayJST();
  return d.events.filter((e) => e.date >= today).sort(byDateTime).slice(0, limit);
}

export function todayEvents(d: AppData): EventRow[] {
  const today = todayJST();
  return d.events.filter((e) => e.date === today).sort(byDateTime);
}

export function todayLiveEvents(d: AppData): EventRow[] {
  const today = todayJST();
  return d.events
    .filter(
      (e) =>
        e.date === today &&
        LIVE_DAY_CATEGORIES.includes(e.category as (typeof LIVE_DAY_CATEGORIES)[number])
    )
    .sort(byDateTime);
}

export function nextLiveEvent(d: AppData): EventRow | null {
  const today = todayJST();
  return (
    d.events
      .filter(
        (e) =>
          e.date >= today &&
          LIVE_DAY_CATEGORIES.includes(e.category as (typeof LIVE_DAY_CATEGORIES)[number])
      )
      .sort(byDateTime)[0] ?? null
  );
}

export function upcomingDeadlines(d: AppData, withinDays: number): EventRow[] {
  const today = todayJST();
  const limit = new Date(Date.parse(`${today}T00:00:00Z`) + withinDays * 86400000)
    .toISOString()
    .slice(0, 10);
  return d.events
    .filter(
      (e) =>
        e.date >= today &&
        e.date <= limit &&
        DEADLINE_CATEGORIES.includes(e.category as (typeof DEADLINE_CATEGORIES)[number])
    )
    .sort(byDateTime);
}

export function liveDayCandidates(d: AppData, limit: number): EventRow[] {
  const lives = d.events.filter((e) =>
    LIVE_DAY_CATEGORIES.includes(e.category as (typeof LIVE_DAY_CATEGORIES)[number])
  );
  const today = todayJST();
  const future = lives.filter((e) => e.date >= today).sort(byDateTime);
  const past = lives.filter((e) => e.date < today).sort((a, b) => byDateTime(b, a));
  return [...future, ...past].slice(0, limit);
}

export function checklistProgress(d: AppData, checklistId: string): { done: number; total: number } {
  const items = d.items.filter((i) => i.checklist_id === checklistId);
  return { done: items.filter((i) => i.checked).length, total: items.length };
}
