import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getEventsInMonth } from "@/lib/queries";
import { adjacentMonths, formatDateJa, monthGrid, parseMonth, todayJST } from "@/lib/dates";
import { categoryOf, LIVE_DAY_CATEGORIES } from "@/lib/constants";
import { Card, CategoryBadge } from "@/components/ui";
import type { EventRow } from "@/lib/types";

export const dynamic = "force-dynamic";

const WEEK_HEADER = ["日", "月", "火", "水", "木", "金", "土"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const user = await requireUser();
  const { m } = await searchParams;
  const { year, month } = parseMonth(m);
  const events = await getEventsInMonth(user.id, year, month);
  const grid = monthGrid(year, month);
  const { prev, next } = adjacentMonths(year, month);
  const today = todayJST();

  const byDate = new Map<string, EventRow[]>();
  for (const e of events) {
    const list = byDate.get(e.date) ?? [];
    list.push(e);
    byDate.set(e.date, list);
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href={`/calendar?m=${prev}`} className="rounded-xl px-4 py-2 text-lg font-bold" aria-label="前の月">
          ◀
        </Link>
        <h1 className="text-lg font-bold">
          {year}年{month}月
        </h1>
        <Link href={`/calendar?m=${next}`} className="rounded-xl px-4 py-2 text-lg font-bold" aria-label="次の月">
          ▶
        </Link>
      </div>

      <Card>
        <div className="grid grid-cols-7 text-center">
          {WEEK_HEADER.map((w, i) => (
            <div
              key={w}
              className="pb-1 text-[11px] font-bold"
              style={{ color: i === 0 ? "var(--color-warning)" : i === 6 ? "#3E63DD" : "var(--color-muted)" }}
            >
              {w}
            </div>
          ))}
          {grid.flat().map((date, i) => {
            if (!date) return <div key={i} className="h-11" />;
            const dayEvents = byDate.get(date) ?? [];
            const isToday = date === today;
            return (
              <div key={i} className="flex h-11 flex-col items-center pt-1">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? "text-white" : ""}`}
                  style={isToday ? { background: "var(--color-accent)", color: "var(--color-accent-text)" } : undefined}
                >
                  {Number(date.slice(8, 10))}
                </span>
                <span className="mt-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: categoryOf(e.category).color }}
                    />
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      <section>
        <h2 className="mb-2 text-sm font-bold" style={{ color: "var(--color-muted)" }}>
          {month}月の予定
        </h2>
        {events.length === 0 ? (
          <Card>
            <p className="py-2 text-center text-sm" style={{ color: "var(--color-muted)" }}>
              この月の予定はまだありません。
              <br />
              ライブ・発売日・申込期限などを登録しましょう。
            </p>
          </Card>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => {
              const isDeadline = categoryOf(e.category).isDeadline;
              return (
                <li key={e.id}>
                  <Link
                    href={`/events/${e.id}/edit`}
                    className="block rounded-2xl bg-white p-3"
                    style={{
                      boxShadow: "0 1px 3px rgba(61,58,62,0.08)",
                      borderLeft: isDeadline ? "4px solid var(--color-warning)" : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-16 shrink-0 text-sm font-bold">{formatDateJa(e.date)}</span>
                      <CategoryBadge category={e.category} />
                      {e.start_time && (
                        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                          {e.start_time}〜
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold">{e.title}</p>
                    <div className="mt-0.5 flex items-center justify-between">
                      {e.venue ? (
                        <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                          📍 {e.venue}
                        </span>
                      ) : (
                        <span />
                      )}
                      {LIVE_DAY_CATEGORIES.includes(e.category as (typeof LIVE_DAY_CATEGORIES)[number]) && (
                        <span className="text-xs font-bold" style={{ color: "var(--color-accent)" }}>
                          当日モードを見る →
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Link
        href="/events/new"
        className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold shadow-lg"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
        aria-label="予定を追加"
      >
        +
      </Link>
    </main>
  );
}
