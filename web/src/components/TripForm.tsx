"use client";

import { useState } from "react";
import { BUDGET_FIELDS, TRANSPORT_TYPES } from "@/lib/constants";
import type { TripInput } from "@/lib/store";
import type { ScheduleEntry, Trip } from "@/lib/types";
import { SubmitButton } from "./ui";

type EventOption = { id: string; title: string; date: string };

type Props = {
  trip?: Partial<Trip> | null;
  schedule?: ScheduleEntry[];
  events: EventOption[];
  submitLabel: string;
  onSave: (input: TripInput) => void;
};

export default function TripForm({ trip, schedule, events, submitLabel, onSave }: Props) {
  const initialCosts: Record<string, number> = {};
  for (const f of BUDGET_FIELDS) {
    initialCosts[f.key] = trip ? ((trip as unknown as Record<string, number>)[f.key] ?? 0) : 0;
  }
  const [costs, setCosts] = useState(initialCosts);
  const [rows, setRows] = useState<(ScheduleEntry & { key: number })[]>(() => {
    const base = schedule && schedule.length > 0 ? schedule : [{ time: "", label: "" }];
    return base.map((r, i) => ({ ...r, key: i }));
  });
  const [nextKey, setNextKey] = useState(rows.length);
  const [error, setError] = useState("");

  const total = Object.values(costs).reduce((a, b) => a + b, 0);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (name: string) => String(f.get(name) ?? "").trim();
    const yen = (name: string) => {
      const n = Number(v(name).replace(/[,、,\s]/g, ""));
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    };

    const title = v("title");
    if (!title || title.length > 100) {
      setError("プラン名を入力してください(100文字まで)");
      return;
    }
    const transport = v("transport_type");
    const scheduleEntries = rows
      .map((r) => ({ time: r.time.trim(), label: r.label.trim() }))
      .filter((r) => r.time || r.label);

    onSave({
      event_id: v("event_id") || null,
      title,
      origin: v("origin"),
      transport_type: TRANSPORT_TYPES.some((t) => t.value === transport) ? transport : "other",
      depart_time: v("depart_time"),
      arrive_time: v("arrive_time"),
      return_memo: v("return_memo"),
      hotel_name: v("hotel_name"),
      hotel_checkin: v("hotel_checkin"),
      hotel_checkout: v("hotel_checkout"),
      hotel_memo: v("hotel_memo"),
      cost_transport: yen("cost_transport"),
      cost_hotel: yen("cost_hotel"),
      cost_ticket: yen("cost_ticket"),
      cost_goods: yen("cost_goods"),
      cost_food: yen("cost_food"),
      cost_other: yen("cost_other"),
      schedule_json: JSON.stringify(scheduleEntries),
      memo: v("memo"),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p
          className="rounded-xl border-l-4 px-4 py-3 text-sm font-semibold"
          style={{
            background: "var(--color-warning-bg)",
            borderColor: "var(--color-warning)",
            color: "var(--color-warning)",
          }}
        >
          {error}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>基本情報</h2>
        <div>
          <label htmlFor="title">プラン名</label>
          <input type="text" id="title" name="title" required maxLength={100} defaultValue={trip?.title ?? ""} placeholder="例:◯◯ツアー 東京遠征" />
        </div>
        <div>
          <label htmlFor="event_id">紐づける予定(任意)</label>
          <select id="event_id" name="event_id" defaultValue={trip?.event_id ?? ""}>
            <option value="">選択しない</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.date} {e.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="origin">出発地</label>
          <input type="text" id="origin" name="origin" maxLength={100} defaultValue={trip?.origin ?? ""} placeholder="例:名古屋" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>移動</h2>
        <div>
          <label htmlFor="transport_type">交通手段</label>
          <select id="transport_type" name="transport_type" defaultValue={trip?.transport_type ?? "shinkansen"}>
            {TRANSPORT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="depart_time">出発時間</label>
            <input type="text" id="depart_time" name="depart_time" maxLength={100} defaultValue={trip?.depart_time ?? ""} placeholder="例:9:30 のぞみ15号" />
          </div>
          <div>
            <label htmlFor="arrive_time">到着予定</label>
            <input type="text" id="arrive_time" name="arrive_time" maxLength={100} defaultValue={trip?.arrive_time ?? ""} placeholder="例:11:10 東京駅" />
          </div>
        </div>
        <div>
          <label htmlFor="return_memo">帰りのメモ</label>
          <input type="text" id="return_memo" name="return_memo" maxLength={200} defaultValue={trip?.return_memo ?? ""} placeholder="例:最終のぞみ 21:30 東京発" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>宿泊</h2>
        <div>
          <label htmlFor="hotel_name">ホテル名</label>
          <input type="text" id="hotel_name" name="hotel_name" maxLength={100} defaultValue={trip?.hotel_name ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="hotel_checkin">チェックイン</label>
            <input type="text" id="hotel_checkin" name="hotel_checkin" maxLength={100} defaultValue={trip?.hotel_checkin ?? ""} placeholder="例:15:00" />
          </div>
          <div>
            <label htmlFor="hotel_checkout">チェックアウト</label>
            <input type="text" id="hotel_checkout" name="hotel_checkout" maxLength={100} defaultValue={trip?.hotel_checkout ?? ""} placeholder="例:10:00" />
          </div>
        </div>
        <div>
          <label htmlFor="hotel_memo">宿泊メモ</label>
          <input type="text" id="hotel_memo" name="hotel_memo" maxLength={200} defaultValue={trip?.hotel_memo ?? ""} placeholder="例:キャンセル期限 8/3" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>予算(円)</h2>
        {BUDGET_FIELDS.map((f) => (
          <div key={f.key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm font-semibold">{f.label}</span>
            <input
              type="number"
              name={f.key}
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={initialCosts[f.key] || ""}
              placeholder="0"
              onChange={(e) => {
                const n = Number(e.target.value);
                setCosts((prev) => ({ ...prev, [f.key]: Number.isFinite(n) && n > 0 ? Math.floor(n) : 0 }));
              }}
            />
          </div>
        ))}
        <div
          className="flex items-center justify-between rounded-2xl px-4 py-3"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          <span className="text-sm font-bold">合計予算(自動計算)</span>
          <span className="text-xl font-bold">¥{total.toLocaleString("ja-JP")}</span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>当日の行動予定</h2>
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2">
            <input
              type="time"
              className="!w-28 shrink-0"
              value={row.time}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) => (r.key === row.key ? { ...r, time: e.target.value } : r))
                )
              }
            />
            <input
              type="text"
              maxLength={100}
              value={row.label}
              onChange={(e) =>
                setRows((prev) =>
                  prev.map((r) => (r.key === row.key ? { ...r, label: e.target.value } : r))
                )
              }
              placeholder="例:ホテルに荷物を預ける"
            />
            <button
              type="button"
              aria-label="この行を削除"
              className="shrink-0 rounded-full px-2 py-1 text-lg"
              style={{ color: "var(--color-muted)" }}
              onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          className="w-full rounded-xl border-2 border-dashed py-2.5 text-sm font-bold"
          style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}
          onClick={() => {
            setRows((prev) => [...prev, { time: "", label: "", key: nextKey }]);
            setNextKey((k) => k + 1);
          }}
        >
          + 行を追加
        </button>
      </section>

      <div>
        <label htmlFor="memo">メモ(任意)</label>
        <textarea id="memo" name="memo" rows={2} maxLength={1000} defaultValue={trip?.memo ?? ""} />
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
