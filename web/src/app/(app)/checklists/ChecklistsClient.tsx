"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addChecklist,
  checklistProgress,
  eventById,
  upcomingEvents,
  useAppData,
} from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { getActiveLinks } from "@/lib/affiliate";
import { formatDateJa } from "@/lib/dates";
import { Card, PrBlock, SubmitButton } from "@/components/ui";

export default function ChecklistsClient() {
  const mounted = useMounted();
  const data = useAppData();
  const router = useRouter();
  const params = useSearchParams();
  const presetEventId = params.get("event") ?? "";
  const [error, setError] = useState("");
  if (!mounted) return <main className="py-20" />;

  const lists = [...data.checklists].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const events = upcomingEvents(data, 20);
  const presetEvent = presetEventId ? eventById(data, presetEventId) : null;
  const eventOptions = [
    ...(presetEvent && !events.some((e) => e.id === presetEvent.id) ? [presetEvent] : []),
    ...events,
  ];

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const title = String(f.get("title") ?? "").trim();
    const eventId = String(f.get("event_id") ?? "").trim() || null;
    const useTemplate = f.get("use_template") === "1";
    if (!title || title.length > 100) {
      setError("リスト名を入力してください(100文字まで)");
      return;
    }
    const id = addChecklist(title, eventId, useTemplate);
    router.push(`/checklists/view/?id=${id}`);
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">🎒 持ち物チェックリスト</h1>

      {lists.length > 0 && (
        <ul className="space-y-2">
          {lists.map((list) => {
            const progress = checklistProgress(data, list.id);
            const event = list.event_id ? eventById(data, list.event_id) : null;
            const done = progress.total > 0 && progress.done === progress.total;
            return (
              <li key={list.id}>
                <Link
                  href={`/checklists/view/?id=${list.id}`}
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
        {error && (
          <p className="mb-3 text-sm font-semibold" style={{ color: "var(--color-warning)" }}>
            {error}
          </p>
        )}
        <form onSubmit={handleCreate} className="space-y-4">
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

      <PrBlock title="持ち物の準備に" links={getActiveLinks("goods")} />
    </main>
  );
}
