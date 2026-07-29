"use server";

import { redirect } from "next/navigation";
import crypto from "node:crypto";
import { getDb } from "../db";
import { nowISO } from "../dates";
import { createSession, destroySession, hashPassword, verifyPassword } from "../auth";
import type { User } from "../types";

function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("/register", "メールアドレスの形式が正しくありません");
  if (password.length < 8) fail("/register", "パスワードは8文字以上にしてください");
  if (!displayName || displayName.length > 30) fail("/register", "ニックネームは1〜30文字で入力してください");

  const db = getDb();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) fail("/register", "このメールアドレスはすでに登録されています");

  // MVP簡易方式:最初に登録したユーザーを管理者にする
  const count = (db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number }).c;
  const id = crypto.randomUUID();
  const now = nowISO();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name, is_admin, plan, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'free', ?, ?)`
  ).run(id, email, hashPassword(password), displayName, count === 0 ? 1 : 0, now, now);

  await createSession(id);
  redirect("/setup");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | User
    | undefined;
  if (!user || !verifyPassword(password, user.password_hash)) {
    fail("/login", "メールアドレスまたはパスワードが違います");
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
