import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../password";

describe("password", () => {
  it("正しいパスワードを検証できる", () => {
    const stored = hashPassword("oshi-katsu-8moji");
    expect(verifyPassword("oshi-katsu-8moji", stored)).toBe(true);
  });
  it("間違ったパスワードは拒否する", () => {
    const stored = hashPassword("oshi-katsu-8moji");
    expect(verifyPassword("chigau-password", stored)).toBe(false);
  });
  it("平文がそのまま保存されない", () => {
    const stored = hashPassword("oshi-katsu-8moji");
    expect(stored).not.toContain("oshi-katsu-8moji");
    expect(stored).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  });
  it("壊れた保存形式は拒否する", () => {
    expect(verifyPassword("x", "not-a-hash")).toBe(false);
    expect(verifyPassword("x", "")).toBe(false);
  });
});
