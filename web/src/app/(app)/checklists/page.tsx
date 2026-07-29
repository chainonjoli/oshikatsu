import Link from "next/link";
import { requireUser } from "@/lib/auth";
import {
  getActiveLinks,
  getChecklistProgress,
  getChecklists,
  getEvent,
  getUpcomingEvents,
} from "@/lib/queries";
import { createChecklistAction } from "@/lib/actions/checklists";
import { formatDateJa } from "@/lib/dates";
import { Card, ErrorBanner, PrBlock, SubmitButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ChecklistsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; event?: string }>;
}) {
  const user = await requireUser();
  const { error, event: presetEventId } = await searchParams;
  const lists = getChecklists(user.id);
  const events = getUpcomingEvents(user.id, 20);
  const presetEvent = presetEventId ? getEvent(user.id, presetEventId) : null;
  const goodsLinks = getActiveLinks("goods");

  const eventOptions = [
    ...(presetEvent && !events.some((e) => e.id === presetEvent.id) ? [presetEvent] : []),
    ...events,
  ];

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">🎒 持ち物チェックリスト</h1>
      <ErrorBanner message={error} />

      {lists.length > 0 && (
        <ul className="space-y-2">
          {lists.map((list) => {
            const progress = getChecklistProgress(list.id);
            const event = list.event_id ? getEvent(user.id, list.event_id) : null;
            const done = progress.total > 0 && progress.done === progress.total;
            return (
              <li key={list.id}>
                <Link
                  href={`/checklists/${list.id}`}
                  className="block rounded-2xl bg-white p-4"
                  style={{ boxShadow: "0 1px 3px rgba(61,58,62,0.08)" }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold">{list.title}</p>
                    <span
                      className="text-xs font-bold"
                      style={{ color: done ? "var(--color-ok)" : "var(--color-warning)" }}
                    >
                      {progress.done}/{progress.total} 完了
                    </span>
                  </div>
                  {event && (
                    <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                      {formatDateJa(event.date)} {event.title}
                    </p>
                  )}
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--color-line)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress.total === 0 ? 0 : Math.round((progress.done / progress.total) * 100)}%`,
                        background: done ? "var(--color-ok)" : "var(--color-accent)",
                      }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Card>
        <h2 className="mb-3 text-sm font-bold" style={{ color: "var(--color-muted)" }}>
          新しいリストを作る
        </h2>
        <form action={createChecklistAction} className="space-y-4">
          <div>
            <label htmlFor="title">リスト名</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={100}
              defaultValue={presetEvent ? `${presetEvent.title} の持ち物` : ""}
              placeholder="例:◯◯ツアー 東京公演の持ち物"
            />
          </div>
          <div>
            <label htmlFor="event_id">イベントに紐づける(任意)</label>
            <select id="event_id" name="event_id" defaultValue={presetEvent?.id ?? ""}>
              <option value="">選択しない</option>
              {eventOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.date} {e.title}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 !text-sm !font-semibold !text-current">
            <input type="checkbox" name="use_template" value="1" defaultChecked className="h-5 w-5" />
            標準の持ち物セット(16項目)を入れる
          </label>
          <SubmitButton>リストを作成する</SubmitButton>
        </form>
      </Card>

      <PrBlock title="持ち物の準備に" links={goodsLinks} />
    </main>
  );
}
