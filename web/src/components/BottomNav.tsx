"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/calendar", label: "カレンダー", icon: "📅" },
  { href: "/trips", label: "遠征", icon: "🧳" },
  { href: "/checklists", label: "持ち物", icon: "🎒" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white"
      style={{ borderColor: "var(--color-line)", paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md">
        {ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-1"
              style={{ color: active ? "var(--color-accent)" : "var(--color-muted)" }}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
