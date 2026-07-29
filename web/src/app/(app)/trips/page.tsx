"use client";

import Link from "next/link";
import { eventById, useAppData } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { getActiveLinks } from "@/lib/affiliate";
import { formatDateJa } from "@/lib/dates";
import { transportLabel } from "@/lib/constants";
import { tripTotal } from "@/lib/types";
import { Card, PrBlock } from "@/components/ui";

export default function TripsPage() {
  const mounted = useMounted();
  const data = useAppData();
  if (!mounted) return <main className="py-20" />;

  const trips = [...data.trips].sort((a, b) => b.created_at.localeCompare(a.created_at));

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🧳 遠征プラン</h1>
        <Link
          href="/trips/new"
          className="rounded-2xl px-4 py-2.5 text-sm font-bold"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          + 作成する
        </Link>
      </div>

      {trips.length === 0 ? (
        <Card>
          <p className="py-2 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            ライブが決まったら、遠征プランを作りましょう。
            <br />
            交通・宿泊・予算をまとめて管理できます。
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {trips.map((t) => {
            const event = t.event_id ? eventById(data, t.event_id) : null;
            return (
              <li key={t.id}>
                <Link
                  href={`/trips/edit/?id=${t.id}`}
                  className="block rounded-2xl bg-white p-4"
                  style={{ boxShadow: "0 1px 3px rgba(61,58,62,0.08)" }}
                >
                  <p className="text-sm font-bold">{t.title}</p>
                  {event && (
                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                      {formatDateJa(event.date)} {event.title}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span style={{ color: "var(--color-muted)" }}>
                      {t.origin && `${t.origin}発 `}
                      {transportLabel(t.transport_type)}
                      {t.hotel_name && ` / 🏨 ${t.hotel_name}`}
                    </span>
                    <span className="font-bold" style={{ color: "var(--color-accent)" }}>
                      ¥{tripTotal(t).toLocaleString("ja-JP")}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <PrBlock title="ホテルの予約" links={getActiveLinks("hotel")} />
      <PrBlock title="交通の予約" links={getActiveLinks("transport")} />
    </main>
  );
}
