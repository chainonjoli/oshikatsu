"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { run } from "../db";
import { nowISO } from "../dates";
import { requireAdmin } from "../auth";
import { AFFILIATE_CATEGORIES } from "../constants";

function readLinkForm(formData: FormData) {
  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const category = String(formData.get("category") ?? "other");
  const description = String(formData.get("description") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  const errors: string[] = [];
  if (!label || label.length > 100) errors.push("表示名を入力してください(100文字まで)");
  if (!/^https?:\/\//.test(url)) errors.push("URLは http(s):// から入力してください");

  return {
    errors,
    values: {
      label,
      url,
      category: AFFILIATE_CATEGORIES.some((c) => c.value === category) ? category : "other",
      description,
      sortOrder: Number.isFinite(sortOrder) ? Math.floor(sortOrder) : 0,
    },
  };
}

export async function createLinkAction(formData: FormData) {
  await requireAdmin();
  const { errors, values } = readLinkForm(formData);
  if (errors.length > 0) redirect(`/admin/links?error=${encodeURIComponent(errors[0])}`);

  const now = nowISO();
  await run(
    `INSERT INTO affiliate_links (id, label, url, category, description, active, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)`,
    [
      crypto.randomUUID(),
      values.label,
      values.url,
      values.category,
      values.description,
      values.sortOrder,
      now,
      now,
    ]
  );

  revalidatePath("/", "layout");
  redirect("/admin/links");
}

export async function updateLinkAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { errors, values } = readLinkForm(formData);
  if (errors.length > 0) redirect(`/admin/links?error=${encodeURIComponent(errors[0])}`);

  await run(
    `UPDATE affiliate_links SET label = ?, url = ?, category = ?, description = ?, sort_order = ?, updated_at = ?
     WHERE id = ?`,
    [values.label, values.url, values.category, values.description, values.sortOrder, nowISO(), id]
  );

  revalidatePath("/", "layout");
  redirect("/admin/links");
}

export async function toggleLinkAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await run("UPDATE affiliate_links SET active = 1 - active, updated_at = ? WHERE id = ?", [
    nowISO(),
    id,
  ]);
  revalidatePath("/", "layout");
  redirect("/admin/links");
}

export async function deleteLinkAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await run("DELETE FROM affiliate_links WHERE id = ?", [id]);
  revalidatePath("/", "layout");
  redirect("/admin/links");
}
