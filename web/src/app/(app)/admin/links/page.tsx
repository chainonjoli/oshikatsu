import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getAllLinks } from "@/lib/queries";
import {
  createLinkAction,
  deleteLinkAction,
  toggleLinkAction,
  updateLinkAction,
} from "@/lib/actions/admin";
import { AFFILIATE_CATEGORIES } from "@/lib/constants";
import { Card, ErrorBanner, SectionTitle, SubmitButton } from "@/components/ui";

export const dynamic = "force-dynamic";

function categoryLabel(value: string) {
  return AFFILIATE_CATEGORIES.find((c) => c.value === value)?.label ?? "その他";
}

export default async function AdminLinksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;
  const links = getAllLinks();

  return (
    <main className="space-y-4">
      <div>
        <Link href="/settings" className="text-sm font-bold" style={{ color: "var(--color-muted)" }}>
          ← 設定にもどる
        </Link>
        <h1 className="mt-1 text-xl font-bold">アフィリエイトリンク管理</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--color-muted)" }}>
          ここで登録したリンクが、カテゴリーに応じて遠征プランナーや持ち物リストに「PR」表記つきで表示されます。
          特定のASPに固定されません(URLは自由に設定できます)。
        </p>
      </div>

      <ErrorBanner message={error} />

      <Card>
        <SectionTitle>新しいリンクを追加</SectionTitle>
        <form action={createLinkAction} className="space-y-4">
          <div>
            <label htmlFor="label">表示名</label>
            <input type="text" id="label" name="label" required maxLength={100} placeholder="例:◯◯トラベルでホテルを探す" />
          </div>
          <div>
            <label htmlFor="url">URL(アフィリエイトリンク)</label>
            <input type="url" id="url" name="url" required placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="category">カテゴリー</label>
              <select id="category" name="category">
                {AFFILIATE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sort_order">表示順(小さいほど上)</label>
              <input type="number" id="sort_order" name="sort_order" defaultValue={0} inputMode="numeric" />
            </div>
          </div>
          <div>
            <label htmlFor="description">説明文(任意)</label>
            <input type="text" id="description" name="description" maxLength={200} placeholder="例:遠征に便利な駅近ホテルが探せます" />
          </div>
          <SubmitButton>追加する</SubmitButton>
        </form>
      </Card>

      <SectionTitle>登録済みリンク({links.length}件)</SectionTitle>
      {links.length === 0 ? (
        <Card>
          <p className="py-2 text-center text-sm" style={{ color: "var(--color-muted)" }}>
            まだリンクがありません。
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id}>
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{link.label}</p>
                    <p className="truncate text-xs" style={{ color: "var(--color-muted)" }}>
                      {link.url}
                    </p>
                    <p className="mt-1 text-xs">
                      <span
                        className="rounded-full px-2 py-0.5 font-bold"
                        style={{ background: "var(--color-line)" }}
                      >
                        {categoryLabel(link.category)}
                      </span>
                      <span
                        className="ml-2 font-bold"
                        style={{ color: link.active ? "var(--color-ok)" : "var(--color-muted)" }}
                      >
                        {link.active ? "表示中" : "停止中"}
                      </span>
                    </p>
                  </div>
                  <form action={toggleLinkAction} className="shrink-0">
                    <input type="hidden" name="id" value={link.id} />
                    <button
                      type="submit"
                      className="rounded-xl border px-3 py-2 text-xs font-bold"
                      style={{ borderColor: "var(--color-line)" }}
                    >
                      {link.active ? "停止" : "再開"}
                    </button>
                  </form>
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-xs font-bold" style={{ color: "var(--color-accent)" }}>
                    編集する
                  </summary>
                  <form action={updateLinkAction} className="mt-3 space-y-3">
                    <input type="hidden" name="id" value={link.id} />
                    <div>
                      <label>表示名</label>
                      <input type="text" name="label" required maxLength={100} defaultValue={link.label} />
                    </div>
                    <div>
                      <label>URL</label>
                      <input type="url" name="url" required defaultValue={link.url} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label>カテゴリー</label>
                        <select name="category" defaultValue={link.category}>
                          {AFFILIATE_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label>表示順</label>
                        <input type="number" name="sort_order" defaultValue={link.sort_order} inputMode="numeric" />
                      </div>
                    </div>
                    <div>
                      <label>説明文</label>
                      <input type="text" name="description" maxLength={200} defaultValue={link.description} />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl py-2.5 text-sm font-bold"
                      style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
                    >
                      保存する
                    </button>
                  </form>
                  <form action={deleteLinkAction} className="mt-2">
                    <input type="hidden" name="id" value={link.id} />
                    <button type="submit" className="text-xs font-bold" style={{ color: "var(--color-warning)" }}>
                      このリンクを削除
                    </button>
                  </form>
                </details>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
