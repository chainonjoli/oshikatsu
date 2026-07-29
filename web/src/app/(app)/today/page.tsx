import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTodayLiveEvents, getUpcomingEvents, getAllEvents } from "@/lib/queries";
import { formatDateJa } from "@/lib/dates";
import { LIVE_DAY_CATEGORIES } from "@/lib/constants";
import { Card, CategoryBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const user = await requireUser();
  const todayLives = getTodayLiveEvents(user.id);

  if (todayLives.length === 1) redirect(`/today/${todayLives[0].id}`);

  const candidates =
    todayLives.length > 0
      ? todayLives
      : [
          ...getUpcomingEvents(user.id, 20),
          ...getAllEvents(user.id),
        ]
          .filter((e) =>
            LIVE_DAY_CATEGORIES.includes(e.category as (typeof LIVE_DAY_CATEGORIES)[number])
          )
          .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
          .slice(0, 10);

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">🎤 ライブ当日モード</h1>

      {todayLives.length > 0 ? (
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          今日の公演を選んでください。
        </p>
      ) : (
        <Card>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            今日はライブ・舞台の予定がありません。
            <br />
            予定を選ぶと、当日モードの画面をプレビューできます。
          </p>
        </Card>
      )}

      {candidates.length === 0 ? (
        <Card>
          <div className="py-2 text-center">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              ライブ・舞台の予定がまだ登録されていません。
            </p>
            <Link
              href="/events/new"
              className="mt-3 inline-block rounded-2xl px-6 py-3 text-sm font-bold"
              style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
            >
              + 予定を登録する
            </Link>
          </div>
        </Card>
      ) : (
        <ul className="space-y-2">
          {candidates.map((e) => (
            <li key={e.id}>
              <Link
                href={`/today/${e.id}`}
                className="block rounded-2xl bg-white p-4"
                style={{ boxShadow: "0 1px 3px rgba(61,58,62,0.08)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{formatDateJa(e.date)}</span>
                  <CategoryBadge category={e.category} />
                </div>
                <p className="mt-1 text-sm font-semibold">{e.title}</p>
                <p className="mt-1 text-xs font-bold" style={{ color: "var(--color-accent)" }}>
                  当日モードをひらく →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
