import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getActiveLinks, getTrip, getUpcomingEvents, getEvent } from "@/lib/queries";
import { deleteTripAction, updateTripAction } from "@/lib/actions/trips";
import { parseSchedule } from "@/lib/types";
import TripForm from "@/components/TripForm";
import { ErrorBanner, PrBlock } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TripDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { error, saved } = await searchParams;
  const trip = await getTrip(user.id, id);
  if (!trip) notFound();

  const events = await getUpcomingEvents(user.id, 20);
  const linkedEvent = trip.event_id ? await getEvent(user.id, trip.event_id) : null;
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
      <ErrorBanner message={error} />
      <TripForm
        action={updateTripAction}
        trip={trip}
        schedule={parseSchedule(trip.schedule_json)}
        events={options}
        submitLabel="保存する"
      />

      <PrBlock title="ホテルの予約" links={await getActiveLinks("hotel")} />
      <PrBlock title="交通の予約" links={await getActiveLinks("transport")} />

      <form action={deleteTripAction}>
        <input type="hidden" name="id" value={trip.id} />
        <button
          type="submit"
          className="w-full rounded-2xl border py-3 text-sm font-bold"
          style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
        >
          このプランを削除する
        </button>
      </form>
    </main>
  );
}
