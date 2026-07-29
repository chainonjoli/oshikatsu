"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { queryOne, run } from "../db";
import { nowISO } from "../dates";
import { requireUser } from "../auth";
import { isValidHex } from "../colors";

export async function saveOshiAction(formData: FormData) {
  const user = await requireUser();
  const groupName = String(formData.get("group_name") ?? "").trim();
  const memberName = String(formData.get("member_name") ?? "").trim();
  const color = String(formData.get("color") ?? "#E93D82").trim();
  const fanSince = String(formData.get("fan_since") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  const back = String(formData.get("back") ?? "/setup");

  if (!groupName || groupName.length > 50) redirect(`${back}?error=${encodeURIComponent("グループ名を入力してください(50文字まで)")}`);
  if (!memberName || memberName.length > 50) redirect(`${back}?error=${encodeURIComponent("推しの名前を入力してください(50文字まで)")}`);
  const safeColor = isValidHex(color) ? color : "#E93D82";

  const existing = await queryOne<{ id: string }>(
    "SELECT id FROM oshis WHERE user_id = ? ORDER BY created_at LIMIT 1",
    [user.id]
  );
  const now = nowISO();

  if (existing) {
    await run(
      `UPDATE oshis SET group_name = ?, member_name = ?, color = ?, fan_since = ?, memo = ?, updated_at = ?
       WHERE id = ? AND user_id = ?`,
      [groupName, memberName, safeColor, fanSince || null, memo, now, existing.id, user.id]
    );
  } else {
    await run(
      `INSERT INTO oshis (id, user_id, genre, group_name, member_name, color, fan_since, memo, created_at, updated_at)
       VALUES (?, ?, 'idol', ?, ?, ?, ?, ?, ?, ?)`,
      [crypto.randomUUID(), user.id, groupName, memberName, safeColor, fanSince || null, memo, now, now]
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}
