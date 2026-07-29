import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getEvent, getTripByEvent, getChecklistByEvent } from "@/lib/queries";
import { deleteEventAction, updateEventAction } from "@/lib/actions/events";
import { LIVE_DAY_CATEGORIES } from "@/lib/constants";
import EventForm from "@/components/EventForm";
import { ErrorBanner } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { error } = await searchParams;
  const event = getEvent(user.id, id);
  if (!event) notFound();

  const trip = getTripByEvent(user.id, id);
  const checklist = getChecklistByEvent(user.id, id);
  const isLiveDay = LIVE_DAY_CATEGORIES.includes(
    event.category as (typeof LIVE_DAY_CATEGORIES)[number]
  );

  return (
    <main>
      <h1 className="mb-4 text-xl font-bold">予定を編集</h1>
      <ErrorBanner message={error} />

      {isLiveDay && (
        <Link
          href={`/today/${event.id}`}
          className="mb-4 block rounded-2xl px-4 py-3 text-center text-sm font-bold"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          🎤 この予定の当日モードを見る →
        </Link>
      )}

      <div className="mb-4 grid grid-cols-2 gap-2 text-center text-xs font-bold">
        <Link
          href={trip ? `/trips/${trip.id}` : `/trips/new?event=${event.id}`}
          className="rounded-xl border-2 py-2.5"
          style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
        >
          🧳 {trip ? "遠征プランを見る" : "遠征プランを作る"}
        </Link>
        <Link
          href={checklist ? `/checklists/${checklist.id}` : `/checklists?event=${event.id}`}
          className="rounded-xl border-2 py-2.5"
          style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
        >
          🎒 {checklist ? "持ち物リストを見る" : "持ち物リストを作る"}
        </Link>
      </div>

      <EventForm action={updateEventAction} event={event} submitLabel="保存する" />

      <form action={deleteEventAction} className="mt-6">
        <input type="hidden" name="id" value={event.id} />
        <button
          type="submit"
          className="w-full rounded-2xl border py-3 text-sm font-bold"
          style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
        >
          この予定を削除する
        </button>
      </form>
    </main>
  );
}
