"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  addItem,
  addTemplateItems,
  checklistById,
  deleteChecklist,
  deleteItem,
  eventById,
  itemsOf,
  renameItem,
  toggleItem,
  useAppData,
} from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import { getActiveLinks } from "@/lib/affiliate";
import { formatDateJa } from "@/lib/dates";
import { Card, PrBlock } from "@/components/ui";

export default function ChecklistViewClient() {
  const mounted = useMounted();
  const data = useAppData();
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  if (!mounted) return <main className="py-20" />;

  const list = checklistById(data, id);
  if (!list) {
    return (
      <main className="py-10 text-center text-sm" style={{ color: "var(--color-muted)" }}>
        このリストは見つかりませんでした。
        <div className="mt-4">
          <Link href="/checklists" className="font-bold" style={{ color: "var(--color-accent)" }}>
            リスト一覧へもどる
          </Link>
        </div>
      </main>
    );
  }

  const items = itemsOf(data, list.id);
  const done = items.filter((i) => i.checked).length;
  const event = list.event_id ? eventById(data, list.event_id) : null;

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    if (name && name.length <= 50) {
      addItem(id, name);
      form.reset();
    }
  }

  return (
    <main className="space-y-4">
      <div>
        <Link href="/checklists" className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>
          ← リスト一覧
        </Link>
        <h1 className="mt-1 text-xl font-bold">{list.title}</h1>
        {event && (
          <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
            {formatDateJa(event.date)} {event.title}
          </p>
        )}
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold">
            {done} / {items.length} 完了
          </span>
          {items.length > 0 && done === items.length && (
            <span className="text-xs font-bold" style={{ color: "var(--color-ok)" }}>
              ✓ 準備OK!
            </span>
          )}
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full" style={{ background: "var(--color-line)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${items.length === 0 ? 0 : Math.round((done / items.length) * 100)}%`,
              background: items.length > 0 && done === items.length ? "var(--color-ok)" : "var(--color-accent)",
            }}
          />
        </div>

        {items.length === 0 ? (
          <p className="py-2 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            項目がまだありません。下のボタンから追加しましょう。
          </p>
        ) : (
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold"
                    style={
                      item.checked
                        ? { background: "var(--color-ok)", borderColor: "var(--color-ok)", color: "#fff" }
                        : { borderColor: "var(--color-line)", color: "transparent" }
                    }
                  >
                    ✓
                  </span>
                  <span
                    className={`text-[15px] ${item.checked ? "line-through" : ""}`}
                    style={item.checked ? { color: "var(--color-muted)" } : undefined}
                  >
                    {item.name}
                  </span>
                </button>
                <details className="relative shrink-0">
                  <summary
                    className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-lg"
                    style={{ color: "var(--color-muted)" }}
                    aria-label={`${item.name} の編集`}
                  >
                    ⋯
                  </summary>
                  <div
                    className="absolute right-0 z-20 w-56 rounded-xl border bg-white p-3 shadow-lg"
                    style={{ borderColor: "var(--color-line)" }}
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const name = String(new FormData(e.currentTarget).get("name") ?? "").trim();
                        if (name && name.length <= 50) renameItem(item.id, name);
                        (e.currentTarget.closest("details") as HTMLDetailsElement | null)?.removeAttribute("open");
                      }}
                      className="flex gap-1.5"
                    >
                      <input type="text" name="name" defaultValue={item.name} maxLength={50} className="!py-2 !text-sm" />
                      <button
                        type="submit"
                        className="shrink-0 rounded-lg px-3 text-xs font-bold"
                        style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
                      >
                        変更
                      </button>
                    </form>
                    <button
                      type="button"
                      onClick={() => deleteItem(item.id)}
                      className="mt-2 text-xs font-bold"
                      style={{ color: "var(--color-warning)" }}
                    >
                      この項目を削除
                    </button>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input type="text" name="name" required maxLength={50} placeholder="項目を追加(例:チケットの控え)" />
        <button
          type="submit"
          className="shrink-0 rounded-xl px-4 text-sm font-bold"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          追加
        </button>
      </form>

      <button
        type="button"
        onClick={() => addTemplateItems(list.id)}
        className="w-full rounded-xl border-2 border-dashed py-2.5 text-sm font-bold"
        style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}
      >
        + 標準セットの不足分を追加する
      </button>

      <PrBlock title="持ち物の準備に" links={getActiveLinks("goods")} />

      <button
        type="button"
        onClick={() => {
          if (window.confirm("このリストを削除しますか?")) {
            deleteChecklist(list.id);
            router.push("/checklists");
          }
        }}
        className="w-full rounded-2xl border py-3 text-sm font-bold"
        style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
      >
        このリストを削除する
      </button>
    </main>
  );
}
