import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getOshi } from "@/lib/queries";
import { logoutAction } from "@/lib/actions/auth";
import OshiForm from "@/components/OshiForm";
import { Card, ErrorBanner, SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const oshi = await getOshi(user.id);
  const { error } = await searchParams;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">⚙️ 設定</h1>
      <ErrorBanner message={error} />

      <Card>
        <SectionTitle>推しの設定</SectionTitle>
        <OshiForm initial={oshi} backPath="/settings" submitLabel="保存する" />
        <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
          ※ 現在は推し1人まで登録できます(複数登録は今後追加予定)
        </p>
      </Card>

      <Card>
        <SectionTitle>アカウント</SectionTitle>
        <p className="text-sm">
          <span className="font-bold">{user.display_name}</span> さん
        </p>
        <p className="mt-0.5 text-sm" style={{ color: "var(--color-muted)" }}>
          {user.email}
        </p>
        <p className="mt-0.5 text-xs" style={{ color: "var(--color-muted)" }}>
          プラン:無料プラン
        </p>
        <form action={logoutAction} className="mt-3">
          <button
            type="submit"
            className="w-full rounded-xl border py-2.5 text-sm font-bold"
            style={{ borderColor: "var(--color-line)", color: "var(--color-muted)" }}
          >
            ログアウト
          </button>
        </form>
      </Card>

      {user.is_admin === 1 && (
        <Card>
          <SectionTitle>運営メニュー</SectionTitle>
          <Link
            href="/admin/links"
            className="block rounded-xl border-2 py-2.5 text-center text-sm font-bold"
            style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
          >
            アフィリエイトリンク管理 →
          </Link>
        </Card>
      )}

      <Card>
        <SectionTitle>このアプリについて</SectionTitle>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
          本サービスは特定のアーティスト・事務所の公式サービスではありません。
          予定・座席などの情報はご自身で入力・管理いただくものです。
          「PR」表記のあるリンクは広告(アフィリエイト)を含みます。
        </p>
      </Card>
    </main>
  );
}
