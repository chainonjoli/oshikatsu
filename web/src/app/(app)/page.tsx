"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  nextLiveEvent,
  todayEvents,
  todayLiveEvents,
  upcomingDeadlines,
  upcomingEvents,
  useAppData,
} from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { daysBetween, formatDateJa, todayJST } from "@/lib/dates";
import { categoryOf } from "@/lib/constants";
import { BigButton, Card, CategoryBadge, SectionTitle } from "@/components/ui";

export default function HomePage() {
  const mounted = useMounted();
  const data = useAppData();
  const router = useRouter();
  const oshi = data.oshi;

  useEffect(() => {
    if (mounted && !oshi) router.replace("/setup");
  }, [mounted, oshi, router]);

  if (!mounted || !oshi) return <main className="py-20" />;

  const today = todayJST();
  const todayLives = todayLiveEvents(data);
  const nextLive = nextLiveEvent(data);
  const deadlines = upcomingDeadlines(data, 7);
  const todays = todayEvents(data);
  const upcoming = upcomingEvents(data, 4);
  const listed = todays.length > 0 ? todays : upcoming;

  return (
    <main className="space-y-4">
      {/* 推しカラーのヘッダー */}
      <header
        className="rounded-2xl px-5 py-4"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
      >
        <p className="text-xs opacity-90">わたしの推し活</p>
        <p className="mt-0.5 text-lg font-bold">
          ♥ {oshi.member_name}
          <span className="ml-2 text-xs font-normal opacity-90">({oshi.group_name})</span>
        </p>
        {nextLive && (
          <p className="mt-2 rounded-xl bg-white/20 px-3 py-2 text-sm font-bold">
            「{nextLive.title}」まで あと{daysBetween(today, nextLive.date)}日
          </p>
        )}
      </header>

      {/* 当日はライブ当日モードを最上部に大きく */}
      {todayLives.length > 0 && (
        <Link
          href={todayLives.length === 1 ? `/today/view/?id=${todayLives[0].id}` : "/today"}
          className="block rounded-2xl border-2 p-5 text-center"
          style={{ borderColor: "var(--color-accent)", background: "var(--color-surface)" }}
        >
          <p className="text-2xl">🎤</p>
          <p className="mt-1 text-lg font-bold" style={{ color: "var(--color-accent)" }}>
            今日は「{todayLives[0].title}」当日!
          </p>
          <p
            className="mx-auto mt-3 w-full rounded-2xl py-3.5 text-base font-bold"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
          >
            ライブ当日モードをひらく →
          </p>
        </Link>
      )}

      {/* 直近の期限警告 */}
      {deadlines.length > 0 && (
        <div
          className="rounded-2xl border-l-4 px-4 py-3"
          style={{ background: "var(--color-warning-bg)", borderColor: "var(--color-warning)" }}
        >
          <p className="text-sm font-bold" style={{ color: "var(--color-warning)" }}>
            ⚠ 直近の期限(7日以内)
          </p>
          <ul className="mt-1 space-y-1">
            {deadlines.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/events/edit/?id=${e.id}`}
                  className="flex items-baseline gap-2 text-sm font-semibold"
                  style={{ color: "var(--color-warning)" }}
                >
                  <span className="shrink-0">{formatDateJa(e.date)}</span>
                  <span>
                    {categoryOf(e.category).label}「{e.title}」
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 今日の予定・直近の予定 */}
      <Card>
        <SectionTitle>📅 {todays.length > 0 ? "今日の予定" : "直近の予定"}</SectionTitle>
        {listed.length === 0 ? (
          <div className="py-3 text-center">
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              まだ予定がありません。
              <br />
              最初の予定を登録しましょう。
            </p>
            <Link
              href="/events/new"
              className="mt-3 inline-block rounded-2xl px-6 py-3 text-sm font-bold"
              style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
            >
              + 予定を登録する
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {listed.map((e) => (
              <li key={e.id}>
                <Link href={`/events/edit/?id=${e.id}`} className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-sm font-bold">{formatDateJa(e.date)}</span>
                  <CategoryBadge category={e.category} />
                  <span className="truncate text-sm">{e.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* 主要ボタン */}
      <div className="grid grid-cols-2 gap-3">
        <BigButton href="/calendar" icon="📅" label="今日の予定" />
        <BigButton href="/today" icon="🎤" label="ライブ当日モード" />
        <BigButton href="/trips" icon="🧳" label="遠征を計画する" />
        <BigButton href="/checklists" icon="🎒" label="持ち物を確認する" />
        <BigButton href="#" icon="🛍️" label="グッズを管理する" disabled />
        <BigButton href="#" icon="📔" label="推しノート" disabled />
        <BigButton href="#" icon="💬" label="AIに相談する" disabled />
      </div>
    </main>
  );
}
