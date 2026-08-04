"use client";

import Link from "next/link";
import { useState } from "react";
import {
  addSource,
  deleteSource,
  markChecked,
  updateSource,
  useAppData,
} from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { BUILTIN_SOURCES } from "@/lib/sources";
import { daysBetween, formatDateJa, todayJST } from "@/lib/dates";
import { Card, SectionTitle, SubmitButton } from "@/components/ui";

export default function SourcesPage() {
  const mounted = useMounted();
  const data = useAppData();
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  if (!mounted) return <main className="py-20" />;

  const today = todayJST();
  const sources = [...BUILTIN_SOURCES, ...data.sources];

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const label = String(f.get("label") ?? "").trim();
    const url = String(f.get("url") ?? "").trim();
    const note = String(f.get("note") ?? "").trim();
    if (!label || label.length > 50) {
      setError("名前を入力してください(50文字まで)");
      return;
    }
    if (!/^https?:\/\//.test(url)) {
      setError("URLは https:// から始まるものを入力してください");
      return;
    }
    addSource(label, url, note);
    setError("");
    form.reset();
  }

  return (
    <main className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">🔍 情報チェック</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          よく見る公式サイトやSNSを登録しておくと、ここからワンタップで巡回できます。
        </p>
      </div>

      {sources.length === 0 ? (
        <Card>
          <p className="py-2 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            まだ登録がありません。
            <br />
            下のフォームから、いつも確認しているサイトを追加しましょう。
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {sources.map((s) => {
            const lastChecked = data.checks[s.id];
            const days = lastChecked ? daysBetween(lastChecked, today) : null;
            const stale = days === null || days >= 7;
            const isEditing = editingId === s.id;
            return (
              <li key={s.id}>
                <Card>
                  <div className="flex items-start justify-between gap-2">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markChecked(s.id, today)}
                      className="min-w-0 flex-1"
                    >
                      <p className="text-sm font-bold" style={{ color: "var(--color-accent)" }}>
                        {s.label} →
                      </p>
                      {s.note && (
                        <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
                          {s.note}
                        </p>
                      )}
                      <p
                        className="mt-1 text-[11px] font-semibold"
                        style={{ color: stale ? "var(--color-warning)" : "var(--color-ok)" }}
                      >
                        {lastChecked
                          ? days === 0
                            ? "今日チェック済み"
                            : `最終チェック ${formatDateJa(lastChecked)}(${days}日前)`
                          : "まだチェックしていません"}
                      </p>
                    </a>
                    <button
                      type="button"
                      onClick={() => markChecked(s.id, today)}
                      className="shrink-0 rounded-xl border px-3 py-2 text-xs font-bold"
                      style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}
                    >
                      確認済み
                    </button>
                  </div>

                  {!s.builtin && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditing ? null : s.id)}
                        className="text-xs font-bold"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {isEditing ? "閉じる" : "編集・削除"}
                      </button>
                      {isEditing && (
                        <div className="mt-2 space-y-2">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              const f = new FormData(e.currentTarget);
                              const label = String(f.get("label") ?? "").trim();
                              const url = String(f.get("url") ?? "").trim();
                              const note = String(f.get("note") ?? "").trim();
                              if (label && /^https?:\/\//.test(url)) {
                                updateSource(s.id, label, url, note);
                                setEditingId(null);
                              }
                            }}
                            className="space-y-2"
                          >
                            <input type="text" name="label" defaultValue={s.label} maxLength={50} className="!py-2 !text-sm" />
                            <input type="url" name="url" defaultValue={s.url} className="!py-2 !text-sm" />
                            <input type="text" name="note" defaultValue={s.note} maxLength={100} placeholder="メモ(任意)" className="!py-2 !text-sm" />
                            <button
                              type="submit"
                              className="w-full rounded-xl py-2 text-xs font-bold"
                              style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
                            >
                              保存する
                            </button>
                          </form>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`「${s.label}」を削除しますか?`)) {
                                deleteSource(s.id);
                                setEditingId(null);
                              }
                            }}
                            className="text-xs font-bold"
                            style={{ color: "var(--color-warning)" }}
                          >
                            このリンクを削除
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href="/events/import"
        className="block rounded-2xl px-4 py-4 text-center text-sm font-bold"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
      >
        📋 見つけた情報を貼り付けて登録する →
      </Link>

      <Card>
        <SectionTitle>リンクを追加</SectionTitle>
        {error && (
          <p className="mb-3 text-sm font-semibold" style={{ color: "var(--color-warning)" }}>
            {error}
          </p>
        )}
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label htmlFor="label">名前</label>
            <input type="text" id="label" name="label" required maxLength={50} placeholder="例:公式サイト お知らせ" />
          </div>
          <div>
            <label htmlFor="url">URL</label>
            <input type="url" id="url" name="url" required placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="note">メモ(任意)</label>
            <input type="text" id="note" name="note" maxLength={100} placeholder="例:ツアー情報はここ" />
          </div>
          <SubmitButton>追加する</SubmitButton>
        </form>
      </Card>

      <p className="px-1 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
        ここに登録したリンクは、あなたの端末の中だけに保存されます。
        本アプリは各サイトの記事や画像を取り込まず、リンク(入口)のみを扱います。
        内容の閲覧・利用は各サイトの利用規約に従ってください。
      </p>
    </main>
  );
}
