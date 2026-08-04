"use client";

import { useState } from "react";
import { EVENT_CATEGORIES, TICKET_STATUSES } from "@/lib/constants";
import { CITIES } from "@/lib/weather";
import type { EventInput } from "@/lib/store";
import type { EventRow } from "@/lib/types";
import { SubmitButton } from "./ui";

type Props = {
  event?: EventRow | null;
  defaultDate?: string;
  submitLabel: string;
  onSave: (input: EventInput) => void;
};

export default function EventForm({ event, defaultDate, submitLabel, onSave }: Props) {
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const v = (name: string) => String(f.get(name) ?? "").trim();

    const title = v("title");
    const date = v("date");
    const category = v("category");
    if (!title || title.length > 100) {
      setError("タイトルを入力してください(100文字まで)");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError("日付を選択してください");
      return;
    }
    onSave({
      title,
      category: EVENT_CATEGORIES.some((c) => c.value === category) ? category : "other",
      date,
      open_time: v("open_time"),
      start_time: v("start_time"),
      venue: v("venue"),
      city: v("city"),
      seat: v("seat"),
      ticket_status: TICKET_STATUSES.some((s) => s.value === v("ticket_status"))
        ? v("ticket_status")
        : "none",
      weather_memo: v("weather_memo"),
      friends_memo: v("friends_memo"),
      emergency_contact: v("emergency_contact"),
      memo: v("memo"),
      source_note: v("source_note"),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div>
        <label htmlFor="title">タイトル(公演名・予定名)</label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={100}
          defaultValue={event?.title ?? ""}
          placeholder="例:◯◯ツアー 東京公演"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="category">カテゴリー</label>
          <select id="category" name="category" defaultValue={event?.category ?? "live"}>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date">日付</label>
          <input type="date" id="date" name="date" required defaultValue={event?.date ?? defaultDate ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="open_time">開場時間</label>
          <input type="time" id="open_time" name="open_time" defaultValue={event?.open_time ?? ""} />
        </div>
        <div>
          <label htmlFor="start_time">開演・開始時間</label>
          <input type="time" id="start_time" name="start_time" defaultValue={event?.start_time ?? ""} />
        </div>
      </div>

      <div>
        <label htmlFor="venue">会場</label>
        <input type="text" id="venue" name="venue" maxLength={100} defaultValue={event?.venue ?? ""} placeholder="例:東京ドーム" />
      </div>

      <div>
        <label htmlFor="city">会場のある都市(天気の自動表示に使います)</label>
        <select id="city" name="city" defaultValue={event?.city ?? ""}>
          <option value="">選択しない</option>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="seat">座席</label>
          <input type="text" id="seat" name="seat" maxLength={100} defaultValue={event?.seat ?? ""} placeholder="例:アリーナ A3ブロック" />
        </div>
        <div>
          <label htmlFor="ticket_status">チケット状況</label>
          <select id="ticket_status" name="ticket_status" defaultValue={event?.ticket_status ?? "none"}>
            {TICKET_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <details
        className="rounded-2xl bg-white p-4"
        open={!!event && !!(event.weather_memo || event.friends_memo || event.emergency_contact)}
      >
        <summary className="cursor-pointer text-sm font-bold" style={{ color: "var(--color-muted)" }}>
          当日モード用の情報(天気・推し友・緊急連絡先)
        </summary>
        <div className="mt-3 space-y-4">
          <div>
            <label htmlFor="weather_memo">天気メモ(自動表示に付け足したいこと)</label>
            <input type="text" id="weather_memo" name="weather_memo" maxLength={200} defaultValue={event?.weather_memo ?? ""} placeholder="例:午後から雨予報。折りたたみ傘を持つ" />
          </div>
          <div>
            <label htmlFor="friends_memo">推し友メモ(集合場所・時間)</label>
            <input type="text" id="friends_memo" name="friends_memo" maxLength={200} defaultValue={event?.friends_memo ?? ""} placeholder="例:15:00 22番ゲート前で ◯◯ちゃんと集合" />
          </div>
          <div>
            <label htmlFor="emergency_contact">緊急連絡先メモ</label>
            <input type="text" id="emergency_contact" name="emergency_contact" maxLength={200} defaultValue={event?.emergency_contact ?? ""} placeholder="例:◯◯ちゃん 090-xxxx-xxxx" />
          </div>
        </div>
      </details>

      <div>
        <label htmlFor="memo">メモ(任意)</label>
        <textarea id="memo" name="memo" rows={2} maxLength={1000} defaultValue={event?.memo ?? ""} />
      </div>

      <div>
        <label htmlFor="source_note">情報の出どころ(任意)</label>
        <input type="text" id="source_note" name="source_note" maxLength={200} defaultValue={event?.source_note ?? ""} placeholder="例:FC会報、公式サイトのお知らせ" />
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
