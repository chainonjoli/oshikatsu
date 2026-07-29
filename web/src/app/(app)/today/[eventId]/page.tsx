import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getChecklistByEvent,
  getChecklistItems,
  getEvent,
  getTripByEvent,
} from "@/lib/queries";
import { todayJST } from "@/lib/dates";
import LiveDayView from "@/components/LiveDayView";

export const dynamic = "force-dynamic";

export default async function TodayEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const user = await requireUser();
  const { eventId } = await params;
  const event = getEvent(user.id, eventId);
  if (!event) notFound();

  const trip = getTripByEvent(user.id, eventId);
  const checklist = getChecklistByEvent(user.id, eventId);
  const items = checklist ? getChecklistItems(checklist.id) : [];

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
        backPath={`/today/${event.id}`}
      />
    </main>
  );
}
