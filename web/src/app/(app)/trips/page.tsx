import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getActiveLinks, getEvent, getTrips } from "@/lib/queries";
import { formatDateJa } from "@/lib/dates";
import { transportLabel } from "@/lib/constants";
import { tripTotal } from "@/lib/types";
import { Card, PrBlock } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const user = await requireUser();
  const [trips, hotelLinks, transportLinks] = await Promise.all([
    getTrips(user.id),
    getActiveLinks("hotel"),
    getActiveLinks("transport"),
  ]);
  const linkedEvents = await Promise.all(
    trips.map((t) => (t.event_id ? getEvent(user.id, t.event_id) : Promise.resolve(null)))
  );

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
          {trips.map((t, i) => {
            const event = linkedEvents[i];
            return (
              <li key={t.id}>
                <Link
                  href={`/trips/${t.id}`}
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

      <PrBlock title="ホテルの予約" links={hotelLinks} />
      <PrBlock title="交通の予約" links={transportLinks} />
    </main>
  );
}
