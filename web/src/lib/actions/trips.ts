"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { getDb } from "../db";
import { nowISO } from "../dates";
import { requireUser } from "../auth";
import { TRANSPORT_TYPES } from "../constants";
import type { ScheduleEntry } from "../types";

function toYen(value: FormDataEntryValue | null): number {
  const n = Number(String(value ?? "").replace(/[,、,\s]/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

function readTripForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const eventId = String(formData.get("event_id") ?? "").trim();
  const transport = String(formData.get("transport_type") ?? "other");

  // 行動予定:time[] / label[] の並び
  const times = formData.getAll("schedule_time").map((v) => String(v).trim());
  const labels = formData.getAll("schedule_label").map((v) => String(v).trim());
  const schedule: ScheduleEntry[] = [];
  for (let i = 0; i < Math.max(times.length, labels.length); i++) {
    const time = times[i] ?? "";
    const label = labels[i] ?? "";
    if (time || label) schedule.push({ time, label });
  }

  const errors: string[] = [];
  if (!title || title.length > 100) errors.push("プラン名を入力してください(100文字まで)");

  return {
    errors,
    values: {
      title,
      eventId: eventId || null,
      origin: String(formData.get("origin") ?? "").trim(),
      transportType: TRANSPORT_TYPES.some((t) => t.value === transport) ? transport : "other",
      departTime: String(formData.get("depart_time") ?? "").trim(),
      arriveTime: String(formData.get("arrive_time") ?? "").trim(),
      returnMemo: String(formData.get("return_memo") ?? "").trim(),
      hotelName: String(formData.get("hotel_name") ?? "").trim(),
      hotelCheckin: String(formData.get("hotel_checkin") ?? "").trim(),
      hotelCheckout: String(formData.get("hotel_checkout") ?? "").trim(),
      hotelMemo: String(formData.get("hotel_memo") ?? "").trim(),
      costTransport: toYen(formData.get("cost_transport")),
      costHotel: toYen(formData.get("cost_hotel")),
      costTicket: toYen(formData.get("cost_ticket")),
      costGoods: toYen(formData.get("cost_goods")),
      costFood: toYen(formData.get("cost_food")),
      costOther: toYen(formData.get("cost_other")),
      scheduleJson: JSON.stringify(schedule),
      memo: String(formData.get("memo") ?? "").trim(),
    },
  };
}

/** event_id は自分の予定のみ許可(他ユーザーの予定への紐づけを防ぐ) */
function validateEventOwnership(userId: string, eventId: string | null): string | null {
  if (!eventId) return null;
  const row = getDb()
    .prepare("SELECT id FROM events WHERE id = ? AND user_id = ?")
    .get(eventId, userId);
  return row ? eventId : null;
}

export async function createTripAction(formData: FormData) {
  const user = await requireUser();
  const { errors, values } = readTripForm(formData);
  if (errors.length > 0) redirect(`/trips/new?error=${encodeURIComponent(errors[0])}`);

  const eventId = validateEventOwnership(user.id, values.eventId);
  const id = crypto.randomUUID();
  const now = nowISO();

  // 1予定1プラン:既に同じ予定のプランがあれば紐づけを外して作成
  const db = getDb();
  if (eventId) {
    db.prepare("UPDATE trips SET event_id = NULL WHERE event_id = ? AND user_id = ?").run(
      eventId,
      user.id
    );
  }
  db.prepare(
    `INSERT INTO trips (id, user_id, event_id, title, origin, transport_type, depart_time,
      arrive_time, return_memo, hotel_name, hotel_checkin, hotel_checkout, hotel_memo,
      cost_transport, cost_hotel, cost_ticket, cost_goods, cost_food, cost_other,
      schedule_json, memo, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    user.id,
    eventId,
    values.title,
    values.origin,
    values.transportType,
    values.departTime,
    values.arriveTime,
    values.returnMemo,
    values.hotelName,
    values.hotelCheckin,
    values.hotelCheckout,
    values.hotelMemo,
    values.costTransport,
    values.costHotel,
    values.costTicket,
    values.costGoods,
    values.costFood,
    values.costOther,
    values.scheduleJson,
    values.memo,
    now,
    now
  );

  revalidatePath("/", "layout");
  redirect(`/trips/${id}`);
}

export async function updateTripAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const { errors, values } = readTripForm(formData);
  if (errors.length > 0) redirect(`/trips/${id}?error=${encodeURIComponent(errors[0])}`);

  const eventId = validateEventOwnership(user.id, values.eventId);
  const db = getDb();
  if (eventId) {
    db.prepare(
      "UPDATE trips SET event_id = NULL WHERE event_id = ? AND user_id = ? AND id != ?"
    ).run(eventId, user.id, id);
  }
  const result = db
    .prepare(
      `UPDATE trips SET event_id = ?, title = ?, origin = ?, transport_type = ?, depart_time = ?,
        arrive_time = ?, return_memo = ?, hotel_name = ?, hotel_checkin = ?, hotel_checkout = ?,
        hotel_memo = ?, cost_transport = ?, cost_hotel = ?, cost_ticket = ?, cost_goods = ?,
        cost_food = ?, cost_other = ?, schedule_json = ?, memo = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`
    )
    .run(
      eventId,
      values.title,
      values.origin,
      values.transportType,
      values.departTime,
      values.arriveTime,
      values.returnMemo,
      values.hotelName,
      values.hotelCheckin,
      values.hotelCheckout,
      values.hotelMemo,
      values.costTransport,
      values.costHotel,
      values.costTicket,
      values.costGoods,
      values.costFood,
      values.costOther,
      values.scheduleJson,
      values.memo,
      nowISO(),
      id,
      user.id
    );
  if (result.changes === 0) redirect("/trips");

  revalidatePath("/", "layout");
  redirect(`/trips/${id}?saved=1`);
}

export async function deleteTripAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  getDb().prepare("DELETE FROM trips WHERE id = ? AND user_id = ?").run(id, user.id);
  revalidatePath("/", "layout");
  redirect("/trips");
}
