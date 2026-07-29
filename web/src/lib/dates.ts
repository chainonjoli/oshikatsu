// 日付はすべて Asia/Tokyo 基準で判定する

const JST_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 今日の日付(JST)を YYYY-MM-DD で返す */
export function todayJST(): string {
  return JST_FORMAT.format(new Date());
}

/** 現在日時のISO文字列(保存用) */
export function nowISO(): string {
  return new Date().toISOString();
}

/** YYYY-MM-DD 同士の日数差(target - base)。同日は0 */
export function daysBetween(base: string, target: string): number {
  const b = Date.parse(`${base}T00:00:00Z`);
  const t = Date.parse(`${target}T00:00:00Z`);
  return Math.round((t - b) / 86400000);
}

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];

/** YYYY-MM-DD → 「8/10(土)」 */
export function formatDateJa(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${WEEKDAYS_JA[d.getUTCDay()]})`;
}

/** YYYY-MM-DD → 「2026年8月10日(土)」 */
export function formatDateJaLong(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日(${WEEKDAYS_JA[d.getUTCDay()]})`;
}

/** YYYY-MM → { year, month } */
export function parseMonth(m: string | undefined): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(m ?? "");
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const today = todayJST();
  return { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };
}

/** 月カレンダーのグリッド(週ごとの配列、月外は null) */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startWeekday = first.getUTCDay();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** 前月・翌月の YYYY-MM */
export function adjacentMonths(year: number, month: number): { prev: string; next: string } {
  const fmt = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;
  const prev = month === 1 ? fmt(year - 1, 12) : fmt(year, month - 1);
  const next = month === 12 ? fmt(year + 1, 1) : fmt(year, month + 1);
  return { prev, next };
}
