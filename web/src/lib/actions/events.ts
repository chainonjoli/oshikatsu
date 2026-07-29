"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { getDb } from "../db";
import { nowISO } from "../dates";
import { requireUser } from "../auth";
import { EVENT_CATEGORIES, TICKET_STATUSES } from "../constants";

function readEventForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "other");
  const date = String(formData.get("date") ?? "").trim();
  const openTime = String(formData.get("open_time") ?? "").trim();
  const startTime = String(formData.get("start_time") ?? "").trim();
  const venue = String(formData.get("venue") ?? "").trim();
  const seat = String(formData.get("seat") ?? "").trim();
  const ticketStatus = String(formData.get("ticket_status") ?? "none");
  const weatherMemo = String(formData.get("weather_memo") ?? "").trim();
  const friendsMemo = String(formData.get("friends_memo") ?? "").trim();
  const emergencyContact = String(formData.get("emergency_contact") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  const sourceNote = String(formData.get("source_note") ?? "").trim();

  const errors: string[] = [];
  if (!title || title.length > 100) errors.push("タイトルを入力してください(100文字まで)");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push("日付を選択してください");
  if (!EVENT_CATEGORIES.some((c) => c.value === category)) errors.push("カテゴリーが不正です");
  const safeTicket = TICKET_STATUSES.some((s) => s.value === ticketStatus)
    ? ticketStatus
    : "none";

  return {
    errors,
    values: {
      title,
      category,
      date,
      openTime,
      startTime,
      venue,
      seat,
      ticketStatus: safeTicket,
      weatherMemo,
      friendsMemo,
      emergencyContact,
      memo,
      sourceNote,
    },
  };
}

export async function createEventAction(formData: FormData) {
  const user = await requireUser();
  const { errors, values } = readEventForm(formData);
  if (errors.length > 0) redirect(`/events/new?error=${encodeURIComponent(errors[0])}`);

  const oshi = getDb()
    .prepare("SELECT id FROM oshis WHERE user_id = ? ORDER BY created_at LIMIT 1")
    .get(user.id) as { id: string } | undefined;

  const now = nowISO();
  getDb()
    .prepare(
      `INSERT INTO events (id, user_id, oshi_id, title, category, date, open_time, start_time,
        venue, seat, ticket_status, weather_memo, friends_memo, emergency_contact, memo, source_note,
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      crypto.randomUUID(),
      user.id,
      oshi?.id ?? null,
      values.title,
      values.category,
      values.date,
      values.openTime,
      values.startTime,
      values.venue,
      values.seat,
      values.ticketStatus,
      values.weatherMemo,
      values.friendsMemo,
      values.emergencyContact,
      values.memo,
      values.sourceNote,
      now,
      now
    );

  revalidatePath("/", "layout");
  redirect(`/calendar?m=${values.date.slice(0, 7)}`);
}

export async function updateEventAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const { errors, values } = readEventForm(formData);
  if (errors.length > 0) redirect(`/events/${id}/edit?error=${encodeURIComponent(errors[0])}`);

  const result = getDb()
    .prepare(
      `UPDATE events SET title = ?, category = ?, date = ?, open_time = ?, start_time = ?,
        venue = ?, seat = ?, ticket_status = ?, weather_memo = ?, friends_memo = ?,
        emergency_contact = ?, memo = ?, source_note = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`
    )
    .run(
      values.title,
      values.category,
      values.date,
      values.openTime,
      values.startTime,
      values.venue,
      values.seat,
      values.ticketStatus,
      values.weatherMemo,
      values.friendsMemo,
      values.emergencyContact,
      values.memo,
      values.sourceNote,
      nowISO(),
      id,
      user.id
    );
  if (result.changes === 0) redirect("/calendar");

  revalidatePath("/", "layout");
  redirect(`/calendar?m=${values.date.slice(0, 7)}`);
}

export async function deleteEventAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  getDb().prepare("DELETE FROM events WHERE id = ? AND user_id = ?").run(id, user.id);
  revalidatePath("/", "layout");
  redirect("/calendar");
}
