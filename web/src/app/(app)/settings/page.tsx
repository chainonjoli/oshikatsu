"use client";

import { useRef, useState } from "react";
import { clearAllData, exportData, importData, useAppData } from "@/lib/store";
import { useMounted } from "@/lib/useMounted";
import OshiForm from "@/components/OshiForm";
import { Card, SectionTitle } from "@/components/ui";

export default function SettingsPage() {
  const mounted = useMounted();
  const data = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  if (!mounted) return <main className="py-20" />;

  function handleExport() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oshikatsu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importData(String(reader.result ?? ""));
      setMessage(ok ? "バックアップを読み込みました" : "読み込めませんでした(ファイルを確認してください)");
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">⚙️ 設定</h1>

      <Card>
        <SectionTitle>推しの設定</SectionTitle>
        <OshiForm initial={data.oshi} afterSavePath="/settings" submitLabel="保存する" />
        <p className="mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
          ※ 現在は推し1人まで登録できます(複数登録は今後追加予定)
        </p>
      </Card>

      <Card>
        <SectionTitle>データの保存について</SectionTitle>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
          データはこのスマホ(ブラウザ)の中だけに保存されます。会員登録は不要ですが、
          ブラウザの履歴・サイトデータを削除するとデータも消えます。大切なデータは下のボタンでバックアップしてください。
        </p>
        {message && (
          <p className="mt-2 text-sm font-bold" style={{ color: "var(--color-ok)" }}>
            {message}
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-xl border-2 py-2.5 text-sm font-bold"
            style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
          >
            ⬇ バックアップを保存
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-xl border-2 py-2.5 text-sm font-bold"
            style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
          >
            ⬆ バックアップを読み込み
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("すべてのデータを削除しますか?この操作は取り消せません。")) {
              clearAllData();
              setMessage("すべてのデータを削除しました");
            }
          }}
          className="mt-2 w-full rounded-xl border py-2.5 text-sm font-bold"
          style={{ borderColor: "var(--color-warning)", color: "var(--color-warning)" }}
        >
          すべてのデータを削除する
        </button>
      </Card>

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
