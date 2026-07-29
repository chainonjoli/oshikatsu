"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  checklistByEvent,
  eventById,
  itemsOf,
  tripByEvent,
  useAppData,
} from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { todayJST } from "@/lib/dates";
import LiveDayView from "@/components/LiveDayView";

export default function TodayViewClient() {
  const mounted = useMounted();
  const data = useAppData();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  if (!mounted) return <main className="py-20" />;

  const event = eventById(data, id);
  if (!event) {
    return (
      <main className="py-10 text-center text-sm" style={{ color: "var(--color-muted)" }}>
        この予定は見つかりませんでした。
        <div className="mt-4">
          <Link href="/today" className="font-bold" style={{ color: "var(--color-accent)" }}>
            当日モードへもどる
          </Link>
        </div>
      </main>
    );
  }

  const trip = tripByEvent(data, id);
  const checklist = checklistByEvent(data, id);
  const items = checklist ? itemsOf(data, checklist.id) : [];

  return (
    <main>
      <div className="mb-3 flex items-center justify-between">
        <Link href="/" className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>
          ← もどる
        </Link>
        <span className="text-sm font-bold">ライブ当日モード</span>
        <span className="w-12" />
      </div>
      <LiveDayView
        event={event}
        trip={trip}
        checklist={checklist}
        items={items}
        isToday={event.date === todayJST()}
      />
    </main>
  );
}
