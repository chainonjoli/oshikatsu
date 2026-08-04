"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addEvents } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { parseEventsFromText, type ParsedEvent } from "@/lib/parseEvents";
import { todayJST, formatDateJa } from "@/lib/dates";
import { EVENT_CATEGORIES, type EventCategory } from "@/lib/constants";
import { Card, CategoryBadge, SectionTitle } from "@/components/ui";

type Draft = ParsedEvent & { include: boolean; key: number };

const SAMPLE = `8/10(土) Kingツアー2026 東京ドーム 開場16:00 開演18:00
8/13 チケット申込 締切
8/20 当落発表
8/25 支払期限
9/3 新曲シングル 発売`;

export default function ImportEventsPage() {
  const mounted = useMounted();
  const router = useRouter();
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<Draft[] | null>(null);
  if (!mounted) return <main className="py-20" />;

  function handleParse() {
    const parsed = parseEventsFromText(text, todayJST());
    setDrafts(parsed.map((p, i) => ({ ...p, include: true, key: i })));
  }

  function handleRegister() {
    if (!drafts) return;
    const chosen = drafts.filter((d) => d.include);
    if (chosen.length === 0) return;
    addEvents(
      chosen.map((d) => ({
        title: d.title,
        category: d.category,
        date: d.date,
        open_time: d.openTime,
        start_time: d.startTime,
        venue: "",
        seat: "",
        ticket_status: "none",
        weather_memo: "",
        friends_memo: "",
        emergency_contact: "",
        memo: "",
        source_note: "貼り付けから登録",
      }))
    );
    const first = chosen[0].date.slice(0, 7);
    router.push(`/calendar/?m=${first}`);
  }

  const chosenCount = drafts?.filter((d) => d.include).length ?? 0;

  return (
    <main className="space-y-4">
      <div>
        <Link href="/sources" className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>
          ← 情報チェック
        </Link>
        <h1 className="mt-1 text-xl font-bold">📋 貼り付けて一括登録</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          日程が書かれた文章を貼り付けると、日付を読み取って予定の候補を作ります。
          登録する前に必ず内容を確認してください。
        </p>
      </div>

      <Card>
        <SectionTitle>1. 文章を貼り付ける</SectionTitle>
        <textarea
          rows={7}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`1行に1予定で貼り付けてください。例:\n${SAMPLE}`}
          maxLength={5000}
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleParse}
            disabled={!text.trim()}
            className="flex-1 rounded-2xl py-3 text-sm font-bold disabled:opacity-40"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
          >
            読み取る
          </button>
          <button
            type="button"
            onClick={() => {
              setText(SAMPLE);
              setDrafts(null);
            }}
            className="rounded-2xl border px-4 py-3 text-xs font-bold"
            style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}
          >
            例を入れる
          </button>
        </div>
      </Card>

      {drafts !== null && (
        <Card>
          <SectionTitle>2. 内容を確認する</SectionTitle>
          {drafts.length === 0 ? (
            <p className="py-2 text-sm" style={{ color: "var(--color-muted)" }}>
              日付が見つかりませんでした。
              <br />
              「8/10」「2026年8月10日」のように日付が入った行を貼り付けてください。
            </p>
          ) : (
            <>
              <p className="mb-3 text-xs" style={{ color: "var(--color-muted)" }}>
                {drafts.length}件の候補が見つかりました。カテゴリーは自動判定なので、違っていれば変更してください。
              </p>
              <ul className="space-y-3">
                {drafts.map((d) => (
                  <li
                    key={d.key}
                    className="rounded-xl border p-3"
                    style={{
                      borderColor: d.include ? "var(--color-accent)" : "var(--color-line)",
                      opacity: d.include ? 1 : 0.5,
                    }}
                  >
                    <label className="flex items-start gap-2 !text-sm !font-normal !text-current">
                      <input
                        type="checkbox"
                        checked={d.include}
                        onChange={(e) =>
                          setDrafts((prev) =>
                            prev!.map((x) => (x.key === d.key ? { ...x, include: e.target.checked } : x))
                          )
                        }
                        className="mt-0.5 h-5 w-5 shrink-0"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-sm font-bold">{formatDateJa(d.date)}</span>
                          <CategoryBadge category={d.category} />
                          {(d.openTime || d.startTime) && (
                            <span className="text-xs" style={{ color: "var(--color-muted)" }}>
                              {d.openTime && `開場${d.openTime}`}
                              {d.openTime && d.startTime && " / "}
                              {d.startTime && `開演${d.startTime}`}
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm font-semibold">{d.title}</span>
                      </span>
                    </label>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={d.category}
                        onChange={(e) =>
                          setDrafts((prev) =>
                            prev!.map((x) =>
                              x.key === d.key ? { ...x, category: e.target.value as EventCategory } : x
                            )
                          )
                        }
                        className="!py-2 !text-xs"
                        aria-label={`${d.title} のカテゴリー`}
                      >
                        {EVENT_CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className="mt-1 truncate text-[11px]" style={{ color: "var(--color-muted)" }}>
                      元の行:{d.raw}
                    </p>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleRegister}
                disabled={chosenCount === 0}
                className="mt-4 w-full rounded-2xl py-3.5 text-base font-bold disabled:opacity-40"
                style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
              >
                {chosenCount}件をまとめて登録する
              </button>
              <p className="mt-2 text-center text-xs" style={{ color: "var(--color-muted)" }}>
                会場や座席は、登録後にカレンダーから追加できます
              </p>
            </>
          )}
        </Card>
      )}

      <p className="px-1 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
        読み取りは自動判定のため、間違うことがあります。特に申込期限・支払期限は、
        必ず元の情報でご確認ください。
      </p>
    </main>
  );
}
