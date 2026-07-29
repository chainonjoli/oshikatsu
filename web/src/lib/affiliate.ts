import data from "@/data/affiliate-links.json";
import type { AffiliateLink } from "./types";

// アフィリエイトリンクは src/data/affiliate-links.json で管理(ビルド時に取り込み)
const links: AffiliateLink[] = (data.links ?? []).map((l) => ({
  id: String(l.id ?? ""),
  label: String(l.label ?? ""),
  url: String(l.url ?? ""),
  category: String(l.category ?? "other"),
  description: String(l.description ?? ""),
  active: l.active === true,
}));

export function getActiveLinks(category: string): AffiliateLink[] {
  return links.filter((l) => l.active && l.category === category && /^https?:\/\//.test(l.url));
}
