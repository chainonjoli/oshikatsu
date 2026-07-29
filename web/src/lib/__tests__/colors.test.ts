import { describe, expect, it } from "vitest";
import { isValidHex, textOn } from "../colors";

describe("textOn(アクセント色上の文字色)", () => {
  it("暗い色の上は白文字", () => {
    expect(textOn("#3D3A3E")).toBe("#ffffff");
    expect(textOn("#E5484D")).toBe("#ffffff");
  });
  it("明るい色の上は濃い文字", () => {
    expect(textOn("#FFC53D")).toBe("#3d3a3e");
  });
  it("不正な色は白文字にフォールバック", () => {
    expect(textOn("red")).toBe("#ffffff");
  });
});

describe("isValidHex", () => {
  it("#RRGGBB のみ許可", () => {
    expect(isValidHex("#E93D82")).toBe(true);
    expect(isValidHex("E93D82")).toBe(false);
    expect(isValidHex("#FFF")).toBe(false);
    expect(isValidHex('"><script>')).toBe(false);
  });
});
