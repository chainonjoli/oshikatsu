import { requireUser } from "@/lib/auth";
import { getOshi } from "@/lib/queries";
import { textOn } from "@/lib/colors";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const oshi = await getOshi(user.id);
  const accent = oshi?.color ?? "#E93D82";

  return (
    <div
      style={
        {
          "--color-accent": accent,
          "--color-accent-text": textOn(accent),
        } as React.CSSProperties
      }
    >
      <div className="mx-auto max-w-md px-4 pb-24 pt-4">{children}</div>
      <BottomNav />
    </div>
  );
}
