"use client";

import { useAppData } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import OshiForm from "@/components/OshiForm";

export default function SetupPage() {
  const mounted = useMounted();
  const data = useAppData();
  if (!mounted) return <main className="py-20" />;

  return (
    <main>
      <h1 className="text-xl font-bold">あなたの推しを教えてください</h1>
      <p className="mt-1 mb-2 text-sm" style={{ color: "var(--color-muted)" }}>
        推しのテーマカラーがアプリ全体に反映されます。あとから設定でいつでも変えられます。
      </p>
      <p className="mb-5 text-xs" style={{ color: "var(--color-muted)" }}>
        入力したデータはこのスマホ(ブラウザ)の中だけに保存されます。会員登録は不要です。
      </p>
      <OshiForm
        initial={data.oshi}
        afterSavePath="/"
        submitLabel={data.oshi ? "保存する" : "この推しではじめる"}
      />
    </main>
  );
}
