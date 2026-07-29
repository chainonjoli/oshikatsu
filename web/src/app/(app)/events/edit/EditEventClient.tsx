"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  checklistByEvent,
  deleteEvent,
  eventById,
  tripByEvent,
  updateEvent,
  useAppData,
} from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { LIVE_DAY_CATEGORIES } from "@/lib/constants";
import EventForm from "@/components/EventForm";

export default function EditEventClient() {
  const mounted = useMounted();
  const data = useAppData();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  if (!mounted) return <main className="py-20" />;

  const event = eventById(data, id);
  if (!event) {
    return (
      <main className="py-10 text-center text-sm" style={{ color: "var(--color-muted)" }}>
        この予定は見つかりませんでした。
        <div className="mt-4">
          <Link href="/calendar" className="font-bold" style={{ color: "var(--color-accent)" }}>
            カレンダーへもどる
          </Link>
        </div>
      </main>
    );
  }

  const trip = tripByEvent(data, id);
  const checklist = checklistByEvent(data, id);
  const isLiveDay = LIVE_DAY_CATEGORIES.includes(
    event.category as (typeof LIVE_DAY_CATEGORIES)[number]
  );

  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">予定を編集</h1>

      {isLiveDay && (
        <Link
          href={`/today/view/?id=${event.id}`}
          className="mb-4 block rounded-2xl px-4 py-3 text-center text-sm font-bold"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          🎤 この予定の当日モードを見る →
        </Link>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2 text-center text-xs font-bold">
        <Link
          href={trip ? `/trips/edit/?id=${trip.id}` : `/trips/new/?event=${event.id}`}
          className="rounded-xl border-2 py-2.5"
          style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
        >
          🧳 {trip ? "遠征プランを見る" : "遠征プランを作る"}
        </Link>
        <Link
          href={checklist ? `/checklists/view/?id=${checklist.id}` : `/checklists/?event=${event.id}`}
          className="rounded-xl border-2 py-2.5"
          style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
        >
          🎒 {checklist ? "持ち物リストを見る" : "持ち物リストを作る"}
        </Link>
      </div>

      <EventForm
        event={event}
        submitLabel="保存する"
        onSave={(input) => {
          updateEvent(event.id, input);
          router.push(`/calendar/?m=${input.date.slice(0, 7)}`);
        }}
      />

      <button
        type="button"
        onClick={() => {
          if (window.confirm("この予定を削除しますか?")) {
            deleteEvent(event.id);
            router.push("/calendar");
          }
        }}
        className="mt-6 w-full rounded-2xl border py-3 text-sm font-bold"
        style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
      >
        この予定を削除する
      </button>
    </main>
  );
}
