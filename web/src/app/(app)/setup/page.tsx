import { requireUser } from "@/lib/auth";
import { getOshi } from "@/lib/queries";
import OshiForm from "@/components/OshiForm";
import { ErrorBanner } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const oshi = await getOshi(user.id);
  const { error } = await searchParams;

  return (
    <main>
      <h1 className="text-xl font-bold">あなたの推しを教えてください</h1>
      <p className="mt-1 mb-5 text-sm" style={{ color: "var(--color-muted)" }}>
        推しのテーマカラーがアプリ全体に反映されます。あとから設定でいつでも変えられます。
      </p>
      <ErrorBanner message={error} />
      <OshiForm
        initial={oshi}
        backPath="/setup"
        submitLabel={oshi ? "保存する" : "この推しではじめる"}
      />
    </main>
  );
}
