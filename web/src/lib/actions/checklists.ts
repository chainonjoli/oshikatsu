"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { query, queryOne, run } from "../db";
import { nowISO } from "../dates";
import { requireUser } from "../auth";
import { CHECKLIST_TEMPLATE } from "../constants";

async function ownChecklist(userId: string, checklistId: string): Promise<boolean> {
  const row = await queryOne<{ id: string }>(
    "SELECT id FROM checklists WHERE id = ? AND user_id = ?",
    [checklistId, userId]
  );
  return !!row;
}

async function insertTemplate(checklistId: string, startOrder: number): Promise<void> {
  const now = nowISO();
  const existingRows = await query<{ name: string }>(
    "SELECT name FROM checklist_items WHERE checklist_id = ?",
    [checklistId]
  );
  const existing = new Set(existingRows.map((r) => r.name));
  let order = startOrder;
  for (const name of CHECKLIST_TEMPLATE) {
    if (existing.has(name)) continue; // 重複投入を防ぐ
    await run(
      `INSERT INTO checklist_items (id, checklist_id, name, checked, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, 0, ?, ?, ?)`,
      [crypto.randomUUID(), checklistId, name, order++, now, now]
    );
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

  let safeEventId: string | null = null;
  if (eventId) {
    const row = await queryOne<{ id: string }>(
      "SELECT id FROM events WHERE id = ? AND user_id = ?",
      [eventId, user.id]
    );
    safeEventId = row ? eventId : null;
  }

  const id = crypto.randomUUID();
  const now = nowISO();
  await run(
    `INSERT INTO checklists (id, user_id, event_id, title, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, user.id, safeEventId, title, now, now]
  );

  if (useTemplate) await insertTemplate(id, 0);

  revalidatePath("/", "layout");
  redirect(`/checklists/${id}`);
}

export async function addTemplateAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = String(formData.get("checklist_id") ?? "");
  if (!(await ownChecklist(user.id, checklistId))) redirect("/checklists");

  const max = await queryOne<{ m: number }>(
    "SELECT COALESCE(MAX(sort_order), -1) AS m FROM checklist_items WHERE checklist_id = ?",
    [checklistId]
  );
  await insertTemplate(checklistId, Number(max?.m ?? -1) + 1);

  revalidatePath("/", "layout");
  redirect(`/checklists/${checklistId}`);
}

export async function addItemAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = String(formData.get("checklist_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!(await ownChecklist(user.id, checklistId))) redirect("/checklists");
  if (!name || name.length > 50) redirect(`/checklists/${checklistId}`);

  const max = await queryOne<{ m: number }>(
    "SELECT COALESCE(MAX(sort_order), -1) AS m FROM checklist_items WHERE checklist_id = ?",
    [checklistId]
  );
  const now = nowISO();
  await run(
    `INSERT INTO checklist_items (id, checklist_id, name, checked, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, 0, ?, ?, ?)`,
    [crypto.randomUUID(), checklistId, name, Number(max?.m ?? -1) + 1, now, now]
  );

  revalidatePath("/", "layout");
  redirect(`/checklists/${checklistId}`);
}

async function findOwnItem(
  userId: string,
  itemId: string
): Promise<{ id: string; checked: number; checklist_id: string } | null> {
  return queryOne(
    `SELECT i.id, i.checked, i.checklist_id FROM checklist_items i
     JOIN checklists c ON c.id = i.checklist_id
     WHERE i.id = ? AND c.user_id = ?`,
    [itemId, userId]
  );
}

export async function toggleItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");
  const back = String(formData.get("back") ?? "");

  const row = await findOwnItem(user.id, itemId);
  if (!row) redirect("/checklists");

  await run("UPDATE checklist_items SET checked = ?, updated_at = ? WHERE id = ?", [
    row.checked ? 0 : 1,
    nowISO(),
    itemId,
  ]);

  revalidatePath("/", "layout");
  redirect(back.startsWith("/") ? back : `/checklists/${row.checklist_id}`);
}

export async function renameItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  const row = await findOwnItem(user.id, itemId);
  if (!row) redirect("/checklists");
  if (name && name.length <= 50) {
    await run("UPDATE checklist_items SET name = ?, updated_at = ? WHERE id = ?", [
      name,
      nowISO(),
      itemId,
    ]);
  }
  revalidatePath("/", "layout");
  redirect(`/checklists/${row.checklist_id}`);
}

export async function deleteItemAction(formData: FormData) {
  const user = await requireUser();
  const itemId = String(formData.get("item_id") ?? "");

  const row = await findOwnItem(user.id, itemId);
  if (!row) redirect("/checklists");

  await run("DELETE FROM checklist_items WHERE id = ?", [itemId]);
  revalidatePath("/", "layout");
  redirect(`/checklists/${row.checklist_id}`);
}

export async function deleteChecklistAction(formData: FormData) {
  const user = await requireUser();
  const checklistId = String(formData.get("checklist_id") ?? "");
  if (!(await ownChecklist(user.id, checklistId))) redirect("/checklists");
  // 項目 → リストの順に明示的に削除(CASCADEに依存しない)
  await run("DELETE FROM checklist_items WHERE checklist_id = ?", [checklistId]);
  await run("DELETE FROM checklists WHERE id = ? AND user_id = ?", [checklistId, user.id]);
  revalidatePath("/", "layout");
  redirect("/checklists");
}
