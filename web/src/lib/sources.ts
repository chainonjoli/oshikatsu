import data from "@/data/info-sources.json";
import type { InfoSource } from "./types";

// 全ユーザー共通の情報源リンク(src/data/info-sources.json で管理)。
// 内容の転載はせず、リンク(入口)のみを扱う。
const raw = (data.sources ?? []) as unknown[];

export const BUILTIN_SOURCES: InfoSource[] = raw
  .map((s) => {
    const o = (s ?? {}) as Record<string, unknown>;
    return {
      id: String(o.id ?? ""),
      label: String(o.label ?? ""),
      url: String(o.url ?? ""),
      note: String(o.note ?? ""),
      builtin: true,
    };
  })
  .filter((s) => s.id && s.label && /^https?:\/\//.test(s.url));
