import { requireUser } from "@/lib/auth";
import { getActiveLinks, getEvent, getUpcomingEvents } from "@/lib/queries";
import { createTripAction } from "@/lib/actions/trips";
import TripForm from "@/components/TripForm";
import { ErrorBanner, PrBlock } from "@/components/ui";
import type { Trip } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NewTripPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; event?: string }>;
}) {
  const user = await requireUser();
  const { error, event: eventId } = await searchParams;
  const events = getUpcomingEvents(user.id, 20);
  const linkedEvent = eventId ? getEvent(user.id, eventId) : null;

  // 予定から遷移してきた場合はプラン名と紐づけを初期入力
  const draft = linkedEvent
    ? ({
        id: "",
        event_id: linkedEvent.id,
        title: `${linkedEvent.title} 遠征`,
      } as unknown as Trip)
    : null;

  const options = [
    ...(linkedEvent && !events.some((e) => e.id === linkedEvent.id) ? [linkedEvent] : []),
    ...events,
  ].map((e) => ({ id: e.id, title: e.title, date: e.date }));

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">遠征プランを作成</h1>
      <ErrorBanner message={error} />
      <TripForm action={createTripAction} trip={draft} events={options} submitLabel="保存する" />
      <PrBlock title="ホテルの予約" links={getActiveLinks("hotel")} />
      <PrBlock title="交通の予約" links={getActiveLinks("transport")} />
    </main>
  );
}
