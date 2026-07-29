"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { addTrip, eventById, upcomingEvents, useAppData } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { getActiveLinks } from "@/lib/affiliate";
import TripForm from "@/components/TripForm";
import { PrBlock } from "@/components/ui";

export default function NewTripClient() {
  const mounted = useMounted();
  const data = useAppData();
  const router = useRouter();
  const params = useSearchParams();
  const eventId = params.get("event") ?? "";
  if (!mounted) return <main className="py-20" />;

  const events = upcomingEvents(data, 20);
  const linkedEvent = eventId ? eventById(data, eventId) : null;

  const options = [
    ...(linkedEvent && !events.some((e) => e.id === linkedEvent.id) ? [linkedEvent] : []),
    ...events,
  ].map((e) => ({ id: e.id, title: e.title, date: e.date }));

  const draft = linkedEvent
    ? { event_id: linkedEvent.id, title: `${linkedEvent.title} 遠征` }
    : null;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">遠征プランを作成</h1>
      <TripForm
        trip={draft}
        events={options}
        submitLabel="保存する"
        onSave={(input) => {
          const id = addTrip(input);
          router.push(`/trips/edit/?id=${id}`);
        }}
      />
      <PrBlock title="ホテルの予約" links={getActiveLinks("hotel")} />
      <PrBlock title="交通の予約" links={getActiveLinks("transport")} />
    </main>
  );
}
