import { describe, expect, it } from "vitest";
import {
  extractWeekday,
  extractDate,
  extractTimes,
  extractTitle,
  inferCategory,
  inferYear,
  parseEventsFromText,
} from "../parseEvents";

const TODAY = "2026-07-29";

describe("extractDate(日付の読み取り)", () => {
  it("年つきの日付", () => {
    expect(extractDate("2026年8月10日 ライブ", TODAY)?.date).toBe("2026-08-10");
    expect(extractDate("2026/8/10 ライブ", TODAY)?.date).toBe("2026-08-10");
    expect(extractDate("2026-08-10 ライブ", TODAY)?.date).toBe("2026-08-10");
  });

  it("年なしは今年として読む(直近の未来)", () => {
    expect(extractDate("8/10 ライブ", TODAY)?.date).toBe("2026-08-10");
    expect(extractDate("8月10日 ライブ", TODAY)?.date).toBe("2026-08-10");
  });

  it("年なしで大きく過去の日付は来年とみなす", () => {
    // 今日が7/29なので、1/10 は来年の予定と判断する
    expect(extractDate("1/10 ライブ", TODAY)?.date).toBe("2027-01-10");
  });

  it("直近30日以内の過去は今年のまま", () => {
    expect(extractDate("7/20 ライブ", TODAY)?.date).toBe("2026-07-20");
  });

  it("存在しない日付は読み取らない", () => {
    expect(extractDate("2026年2月30日", TODAY)).toBeNull();
    expect(extractDate("13月45日", TODAY)).toBeNull();
  });

  it("日付がない行は null", () => {
    expect(extractDate("チケットについて", TODAY)).toBeNull();
  });

  it("時刻を日付と誤解しない", () => {
    expect(extractDate("開演18:00", TODAY)).toBeNull();
  });
});

describe("inferYear", () => {
  it("うるう年の2/29も扱える", () => {
    expect(inferYear(2, 29, "2028-01-05")).toBe(2028);
  });

  it("曜日が書かれていれば、それに合う年を選ぶ", () => {
    // 2026-08-08 は土曜、2027-08-08 は日曜
    expect(inferYear(8, 8, TODAY, 6)).toBe(2026); // (土) → 今年
    expect(inferYear(8, 8, TODAY, 0)).toBe(2027); // (日) → 来年
  });

  it("どの年にも合わない曜日なら、従来の推測にもどる", () => {
    expect(inferYear(8, 8, TODAY, 3)).toBe(2026);
  });
});

describe("extractWeekday", () => {
  it("全角・半角のかっこに対応する", () => {
    expect(extractWeekday("8/10(土) ライブ")).toBe(6);
    expect(extractWeekday("8/10(日) ライブ")).toBe(0);
    expect(extractWeekday("8/10 ライブ")).toBeNull();
  });
});

describe("extractTimes(時刻の読み取り)", () => {
  it("開場・開演の両方", () => {
    expect(extractTimes("開場16:00 開演18:00")).toEqual({
      openTime: "16:00",
      startTime: "18:00",
    });
  });

  it("「時」表記", () => {
    expect(extractTimes("開演18時30分")).toEqual({ openTime: "", startTime: "18:30" });
  });

  it("ラベルなしの時刻は開演として扱う", () => {
    expect(extractTimes("東京公演 19:00")).toEqual({ openTime: "", startTime: "19:00" });
  });

  it("開場だけの行は開演を重複させない", () => {
    expect(extractTimes("開場17:00")).toEqual({ openTime: "17:00", startTime: "" });
  });

  it("日付を時刻と誤解しない", () => {
    expect(extractTimes("8/10 ライブ")).toEqual({ openTime: "", startTime: "" });
  });

  it("あり得ない時刻は無視する", () => {
    expect(extractTimes("開演99:99")).toEqual({ openTime: "", startTime: "" });
  });
});

describe("inferCategory(カテゴリーの推定)", () => {
  it("期限系を優先して判定する", () => {
    expect(inferCategory("チケット申込 締切")).toBe("ticket_deadline");
    expect(inferCategory("支払期限")).toBe("payment_deadline");
    expect(inferCategory("当落発表")).toBe("lottery_result");
    expect(inferCategory("FC先行 受付期限")).toBe("fc_deadline");
    expect(inferCategory("ホテルのキャンセル期限")).toBe("hotel_cancel_deadline");
  });

  it("公演・メディア・発売を判定する", () => {
    expect(inferCategory("Kingツアー2026 東京ドーム")).toBe("live");
    expect(inferCategory("朗読劇 出演")).toBe("stage");
    expect(inferCategory("音楽番組に出演")).toBe("tv");
    expect(inferCategory("ラジオ 生放送")).toBe("radio");
    expect(inferCategory("新曲シングル 発売")).toBe("cd_dvd");
    expect(inferCategory("雑誌 表紙")).toBe("magazine");
    expect(inferCategory("グッズ販売開始")).toBe("goods");
  });

  it("判断できないものは other", () => {
    expect(inferCategory("なにかの予定")).toBe("other");
  });
});

describe("extractTitle(タイトルの整形)", () => {
  it("日付・曜日・時刻・記号を取り除く", () => {
    expect(extractTitle("・8/10(土) Kingツアー 開場16:00 開演18:00", "8/10")).toBe(
      "Kingツアー"
    );
  });
});

describe("parseEventsFromText(全体)", () => {
  const text = `8/10(土) Kingツアー2026 東京ドーム 開場16:00 開演18:00
8/13 チケット申込 締切
これは日付のない行なので無視される
8/20 当落発表
9/3 新曲シングル 発売`;

  it("日付のある行だけを候補にする", () => {
    const parsed = parseEventsFromText(text, TODAY);
    expect(parsed.length).toBe(4);
  });

  it("日付順に並べる", () => {
    const parsed = parseEventsFromText(text, TODAY);
    expect(parsed.map((p) => p.date)).toEqual([
      "2026-08-10",
      "2026-08-13",
      "2026-08-20",
      "2026-09-03",
    ]);
  });

  it("タイトル・カテゴリー・時刻を取り出す", () => {
    const [live] = parseEventsFromText(text, TODAY);
    expect(live.title).toBe("Kingツアー2026 東京ドーム");
    expect(live.category).toBe("live");
    expect(live.openTime).toBe("16:00");
    expect(live.startTime).toBe("18:00");
  });

  it("同じ内容の行は1件にまとめる", () => {
    const parsed = parseEventsFromText("8/10 ライブ\n8/10 ライブ", TODAY);
    expect(parsed.length).toBe(1);
  });

  it("空文字なら空配列", () => {
    expect(parseEventsFromText("", TODAY)).toEqual([]);
    expect(parseEventsFromText("   \n  \n", TODAY)).toEqual([]);
  });
});
