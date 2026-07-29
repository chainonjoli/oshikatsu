import { describe, expect, it } from "vitest";
import { parseSchedule, tripTotal } from "../types";

describe("tripTotal(遠征予算の自動集計)", () => {
  it("6項目を合計する", () => {
    expect(
      tripTotal({
        cost_transport: 22000,
        cost_hotel: 9800,
        cost_ticket: 9500,
        cost_goods: 15000,
        cost_food: 5000,
        cost_other: 3000,
      })
    ).toBe(64300);
  });
  it("すべて0なら0", () => {
    expect(
      tripTotal({
        cost_transport: 0,
        cost_hotel: 0,
        cost_ticket: 0,
        cost_goods: 0,
        cost_food: 0,
        cost_other: 0,
      })
    ).toBe(0);
  });
});

describe("parseSchedule(行動予定のJSON)", () => {
  it("正常なJSONを読み込む", () => {
    expect(parseSchedule('[{"time":"15:00","label":"集合"}]')).toEqual([
      { time: "15:00", label: "集合" },
    ]);
  });
  it("空行は取り除く", () => {
    expect(parseSchedule('[{"time":"","label":""},{"time":"16:00","label":"開場"}]')).toEqual([
      { time: "16:00", label: "開場" },
    ]);
  });
  it("壊れたJSONは空配列", () => {
    expect(parseSchedule("not json")).toEqual([]);
    expect(parseSchedule('{"a":1}')).toEqual([]);
  });
});
