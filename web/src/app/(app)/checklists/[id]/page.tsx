import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  getActiveLinks,
  getChecklist,
  getChecklistItems,
  getEvent,
} from "@/lib/queries";
import {
  addItemAction,
  addTemplateAction,
  deleteChecklistAction,
  deleteItemAction,
  renameItemAction,
  toggleItemAction,
} from "@/lib/actions/checklists";
import { formatDateJa } from "@/lib/dates";
import { Card, PrBlock } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ChecklistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const list = await getChecklist(user.id, id);
  if (!list) notFound();

  const items = await getChecklistItems(list.id);
  const done = items.filter((i) => i.checked).length;
  const event = list.event_id ? await getEvent(user.id, list.event_id) : null;
  const backPath = `/checklists/${list.id}`;

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
                <form action={toggleItemAction} className="min-w-0 flex-1">
                  <input type="hidden" name="item_id" value={item.id} />
                  <input type="hidden" name="back" value={backPath} />
                  <button type="submit" className="flex min-h-11 w-full items-center gap-3 text-left">
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
                </form>
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
                    <form action={renameItemAction} className="flex gap-1.5">
                      <input type="hidden" name="item_id" value={item.id} />
                      <input type="text" name="name" defaultValue={item.name} maxLength={50} className="!py-2 !text-sm" />
                      <button
                        type="submit"
                        className="shrink-0 rounded-lg px-3 text-xs font-bold"
                        style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
                      >
                        変更
                      </button>
                    </form>
                    <form action={deleteItemAction} className="mt-2">
                      <input type="hidden" name="item_id" value={item.id} />
                      <button type="submit" className="text-xs font-bold" style={{ color: "var(--color-warning)" }}>
                        この項目を削除
                      </button>
                    </form>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <form action={addItemAction} className="flex gap-2">
        <input type="hidden" name="checklist_id" value={list.id} />
        <input type="text" name="name" required maxLength={50} placeholder="項目を追加(例:チケットの控え)" />
        <button
          type="submit"
          className="shrink-0 rounded-xl px-4 text-sm font-bold"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
        >
          追加
        </button>
      </form>

      <form action={addTemplateAction}>
        <input type="hidden" name="checklist_id" value={list.id} />
        <button
          type="submit"
          className="w-full rounded-xl border-2 border-dashed py-2.5 text-sm font-bold"
          style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}
        >
          + 標準セットの不足分を追加する
        </button>
      </form>

      <PrBlock title="持ち物の準備に" links={await getActiveLinks("goods")} />

      <form action={deleteChecklistAction}>
        <input type="hidden" name="checklist_id" value={list.id} />
        <button
          type="submit"
          className="w-full rounded-2xl border py-3 text-sm font-bold"
          style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
        >
          このリストを削除する
        </button>
      </form>
    </main>
  );
}
