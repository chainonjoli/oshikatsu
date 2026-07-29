import Link from "next/link";
import { categoryOf } from "@/lib/constants";
import type { AffiliateLink } from "@/lib/types";

/** エラーメッセージ表示(URLの ?error= から) */
export function ErrorBanner({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div
      className="mb-4 rounded-xl border-l-4 px-4 py-3 text-sm font-semibold"
      style={{
        background: "var(--color-warning-bg)",
        borderColor: "var(--color-warning)",
        color: "var(--color-warning)",
      }}
    >
      {message}
    </div>
  );
}

/** 警告バナー(未完了・期限) */
export function WarningCard({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div
      className="rounded-2xl border-l-4 px-4 py-3"
      style={{ background: "var(--color-warning-bg)", borderColor: "var(--color-warning)" }}
    >
      <p className="text-sm font-bold" style={{ color: "var(--color-warning)" }}>
        ⚠ {title}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm" style={{ color: "var(--color-warning)" }}>
            ・{item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** カテゴリーバッジ */
export function CategoryBadge({ category }: { category: string }) {
  const c = categoryOf(category);
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
      style={{ background: c.color }}
    >
      {c.label}
    </span>
  );
}

/** カード */
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl bg-white p-4 shadow-sm ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(61,58,62,0.08)" }}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 text-sm font-bold" style={{ color: "var(--color-muted)" }}>{children}</h2>;
}

/** アフィリエイト表示ブロック(【PR】表記必須) */
export function PrBlock({ title, links }: { title: string; links: AffiliateLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: "var(--color-line)", background: "#FFFDF8" }}>
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-gray-500 px-1.5 py-0.5 text-[10px] font-bold text-white">PR</span>
        <span className="text-xs font-bold" style={{ color: "var(--color-muted)" }}>
          {title}(広告を含みます)
        </span>
      </div>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="block rounded-xl border px-3 py-2.5"
              style={{ borderColor: "var(--color-line)" }}
            >
              <span className="text-sm font-bold" style={{ color: "var(--color-accent)" }}>
                {link.label} →
              </span>
              {link.description && (
                <span className="mt-0.5 block text-xs" style={{ color: "var(--color-muted)" }}>
                  {link.description}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** 大きな主要ボタン(リンク) */
export function BigButton({
  href,
  icon,
  label,
  disabled = false,
}: {
  href: string;
  icon: string;
  label: string;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div
        className="relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl bg-white opacity-60"
        style={{ boxShadow: "0 1px 3px rgba(61,58,62,0.08)" }}
      >
        <span className="absolute right-2 top-2 rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-500">
          準備中
        </span>
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-bold" style={{ color: "var(--color-muted)" }}>{label}</span>
      </div>
    );
  }
  return (
    <Link
      href={href}
      className="flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl bg-white active:opacity-70"
      style={{ boxShadow: "0 1px 3px rgba(61,58,62,0.08)" }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}

/** 保存ボタン */
export function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-2xl py-3.5 text-base font-bold active:opacity-80"
      style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
    >
      {children}
    </button>
  );
}
