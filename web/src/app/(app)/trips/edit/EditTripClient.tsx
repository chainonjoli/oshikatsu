"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deleteTrip,
  eventById,
  tripById,
  upcomingEvents,
  updateTrip,
  useAppData,
} from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { getActiveLinks } from "@/lib/affiliate";
import { parseSchedule } from "@/lib/types";
import TripForm from "@/components/TripForm";
import { PrBlock } from "@/components/ui";

export default function EditTripClient() {
  const mounted = useMounted();
  const data = useAppData();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [saved, setSaved] = useState(false);
  if (!mounted) return <main className="py-20" />;

  const trip = tripById(data, id);
  if (!trip) {
    return (
      <main className="py-10 text-center text-sm" style={{ color: "var(--color-muted)" }}>
        このプランは見つかりませんでした。
        <div className="mt-4">
          <Link href="/trips" className="font-bold" style={{ color: "var(--color-accent)" }}>
            遠征プラン一覧へもどる
          </Link>
        </div>
      </main>
    );
  }

  const events = upcomingEvents(data, 20);
  const linkedEvent = trip.event_id ? eventById(data, trip.event_id) : null;
  const options = [
    ...(linkedEvent && !events.some((e) => e.id === linkedEvent.id) ? [linkedEvent] : []),
    ...events,
  ].map((e) => ({ id: e.id, title: e.title, date: e.date }));

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">遠征プランを編集</h1>
      {saved && (
        <p
          className="rounded-xl px-3 py-2 text-center text-xs font-bold"
          style={{ background: "#E8F7EF", color: "var(--color-ok)" }}
        >
          保存しました
        </p>
      )}
      <TripForm
        trip={trip}
        schedule={parseSchedule(trip.schedule_json)}
        events={options}
        submitLabel="保存する"
        onSave={(input) => {
          updateTrip(trip.id, input);
          setSaved(true);
          window.scrollTo({ top: 0 });
        }}
      />

      <PrBlock title="ホテルの予約" links={getActiveLinks("hotel")} />
      <PrBlock title="交通の予約" links={getActiveLinks("transport")} />

      <button
        type="button"
        onClick={() => {
          if (window.confirm("このプランを削除しますか?")) {
            deleteTrip(trip.id);
            router.push("/trips");
          }
        }}
        className="w-full rounded-2xl border py-3 text-sm font-bold"
        style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
      >
        このプランを削除する
      </button>
    </main>
  );
}
