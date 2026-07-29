import { describe, expect, it } from "vitest";
import {
  adjacentMonths,
  daysBetween,
  formatDateJa,
  formatDateJaLong,
  monthGrid,
  parseMonth,
  todayJST,
} from "../dates";

describe("todayJST", () => {
  it("YYYY-MM-DD 形式を返す", () => {
    expect(todayJST()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("daysBetween", () => {
  it("同日は0", () => {
    expect(daysBetween("2026-08-10", "2026-08-10")).toBe(0);
  });
  it("未来はプラス", () => {
    expect(daysBetween("2026-08-01", "2026-08-10")).toBe(9);
  });
  it("過去はマイナス", () => {
    expect(daysBetween("2026-08-10", "2026-08-01")).toBe(-9);
  });
  it("月またぎ", () => {
    expect(daysBetween("2026-07-29", "2026-08-01")).toBe(3);
  });
});

describe("formatDateJa", () => {
  it("曜日つきで整形する", () => {
    // 2026-08-10 は月曜
    expect(formatDateJa("2026-08-10")).toBe("8/10(月)");
    expect(formatDateJaLong("2026-08-10")).toBe("2026年8月10日(月)");
  });
  it("不正な日付はそのまま返す", () => {
    expect(formatDateJa("invalid")).toBe("invalid");
  });
});

describe("parseMonth", () => {
  it("YYYY-MM を解釈する", () => {
    expect(parseMonth("2026-08")).toEqual({ year: 2026, month: 8 });
  });
  it("不正値は今月にフォールバック", () => {
    const today = todayJST();
    expect(parseMonth("bad")).toEqual({
      year: Number(today.slice(0, 4)),
      month: Number(today.slice(5, 7)),
    });
    expect(parseMonth("2026-13").month).not.toBe(13);
  });
});

describe("monthGrid", () => {
  it("2026年8月は土曜はじまり・31日", () => {
    const grid = monthGrid(2026, 8);
    const flat = grid.flat();
    expect(flat.filter(Boolean).length).toBe(31);
    // 8/1 は土曜 → 先頭6セルは null
    expect(flat.slice(0, 6).every((c) => c === null)).toBe(true);
    expect(flat[6]).toBe("2026-08-01");
    expect(flat.length % 7).toBe(0);
  });
});

describe("adjacentMonths", () => {
  it("年またぎを処理する", () => {
    expect(adjacentMonths(2026, 1)).toEqual({ prev: "2025-12", next: "2026-02" });
    expect(adjacentMonths(2026, 12)).toEqual({ prev: "2026-11", next: "2027-01" });
  });
});
