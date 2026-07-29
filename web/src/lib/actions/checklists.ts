"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { getDb } from "../db";
import { nowISO } from "../dates";
import { requireUser } from "../auth";
import { CHECKLIST_TEMPLATE } from "../constants";

function ownChecklist(userId: string, checklistId: string): boolean {
  return !!getDb()
    .prepare("SELECT id FROM checklists WHERE id = ? AND user_id = ?")
    .get(checklistId, userId);
}

function insertTemplate(checklistId: string, startOrder: number) {
  const db = getDb();
  const now = nowISO();
  const stmt = db.prepare(
    `INSERT INTO checklist_items (id, checklist_id, name, checked, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, ?, ?)`
  );
  const existing = new Set(
    (
      db
        .prepare("SELECT name FROM checklist_items WHERE checklist_id = ?")
        .all(checklistId) as { name: string }[]
    ).map((r) => r.name)
  );
  let order = startOrder;
  for (const name of CHECKLIST_TEMPLATE) {
    if (existing.has(name)) continue; // 重複投入を防ぐ
    stmt.run(crypto.randomUUID(), checklistId, name, order++, now, now);
  }
}

export async function createChecklistAction(formData: FormData) {
  const user = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const eventId = String(formData.get("event_id") ?? "").trim();
  const useTemplate = formData.get("use_template") === "1";

  if (!title || title.length > 100) {
    redirect(`/checklists?error=${encodeURIComponent("リスト名を入力してください(100文字まで)")}`);
  }

  const db = getDb();
  let safeEventId: string | null = null;
  if (eventId) {
    const row = db
      .prepare("SELECT id FROM events WHERE id = ? AND user_id = ?")
      .get(eventId, user.id);
    safeEventId = row ? eventId : null;
  }

  const id = crypto.randomUUID();
  const now = nowISO();
  db.prepare(
    `INSERT INTO checklists (id, user_id, event_id, title, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, user.id, safeEventId, title, now, now);

  if (useTemplate) insertTemplate(id, 0);

  revalidatePath("/", "layout");
  redirect(`/checklists/${id}`);
}

export async function addTemplateAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = String(formData.get("checklist_id") ?? "");
  if (!ownChecklist(user.id, checklistId)) redirect("/checklists");

  const max = getDb()
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM checklist_items WHERE checklist_id = ?")
    .get(checklistId) as { m: number };
  insertTemplate(checklistId, max.m + 1);

  revalidatePath("/", "layout");
  redirect(`/checklists/${checklistId}`);
}

export async function addItemAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = String(formData.get("checklist_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!ownChecklist(user.id, checklistId)) redirect("/checklists");
  if (!name || name.length > 50) redirect(`/checklists/${checklistId}`);

  const db = getDb();
  const max = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM checklist_items WHERE checklist_id = ?")
    .get(checklistId) as { m: number };
  const now = nowISO();
  db.prepare(
    `INSERT INTO checklist_items (id, checklist_id, name, checked, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, ?, ?)`
  ).run(crypto.randomUUID(), checklistId, name, max.m + 1, now, now);

  revalidatePath("/", "layout");
  redirect(`/checklists/${checklistId}`);
}

export async function toggleItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");
  const back = String(formData.get("back") ?? "");

  const db = getDb();
  const row = db
    .prepare(
      `SELECT i.id, i.checked, i.checklist_id FROM checklist_items i
       JOIN checklists c ON c.id = i.checklist_id
       WHERE i.id = ? AND c.user_id = ?`
    )
    .get(itemId, user.id) as { id: string; checked: number; checklist_id: string } | undefined;
  if (!row) redirect("/checklists");

  db.prepare("UPDATE checklist_items SET checked = ?, updated_at = ? WHERE id = ?").run(
    row.checked ? 0 : 1,
    nowISO(),
    itemId
  );

  revalidatePath("/", "layout");
  redirect(back.startsWith("/") ? back : `/checklists/${row.checklist_id}`);
}

export async function renameItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const db = getDb();
  const row = db
    .prepare(
      `SELECT i.id, i.checklist_id FROM checklist_items i
       JOIN checklists c ON c.id = i.checklist_id
       WHERE i.id = ? AND c.user_id = ?`
    )
    .get(itemId, user.id) as { id: string; checklist_id: string } | undefined;
  if (!row) redirect("/checklists");
  if (name && name.length <= 50) {
    db.prepare("UPDATE checklist_items SET name = ?, updated_at = ? WHERE id = ?").run(
      name,
      nowISO(),
      itemId
    );
  }
  revalidatePath("/", "layout");
  redirect(`/checklists/${row.checklist_id}`);
}

export async function deleteItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");

  const db = getDb();
  const row = db
    .prepare(
      `SELECT i.id, i.checklist_id FROM checklist_items i
       JOIN checklists c ON c.id = i.checklist_id
       WHERE i.id = ? AND c.user_id = ?`
    )
    .get(itemId, user.id) as { id: string; checklist_id: string } | undefined;
  if (!row) redirect("/checklists");

  db.prepare("DELETE FROM checklist_items WHERE id = ?").run(itemId);
  revalidatePath("/", "layout");
  redirect(`/checklists/${row.checklist_id}`);
}

export async function deleteChecklistAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = String(formData.get("checklist_id") ?? "");
  if (!ownChecklist(user.id, checklistId)) redirect("/checklists");
  getDb().prepare("DELETE FROM checklists WHERE id = ? AND user_id = ?").run(checklistId, user.id);
  revalidatePath("/", "layout");
  redirect("/checklists");
}
