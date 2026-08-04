import { describe, expect, it } from "vitest";
import {
  CITIES,
  cityById,
  forecastUrl,
  isForecastable,
  needsUmbrella,
  parseForecast,
  weatherLabel,
} from "../weather";

describe("CITIES", () => {
  it("IDが重複していない", () => {
    expect(new Set(CITIES.map((c) => c.id)).size).toBe(CITIES.length);
  });
  it("緯度経度が日本の範囲に収まっている", () => {
    for (const c of CITIES) {
      expect(c.lat).toBeGreaterThan(24);
      expect(c.lat).toBeLessThan(46);
      expect(c.lon).toBeGreaterThan(122);
      expect(c.lon).toBeLessThan(154);
    }
  });
  it("IDから都市を引ける", () => {
    expect(cityById("tokyo")?.label).toBe("東京");
    expect(cityById("unknown")).toBeNull();
    expect(cityById(undefined)).toBeNull();
  });
});

describe("weatherLabel", () => {
  it("主な天気コードを日本語にする", () => {
    expect(weatherLabel(0).text).toBe("快晴");
    expect(weatherLabel(3).text).toBe("くもり");
    expect(weatherLabel(63).text).toBe("雨");
    expect(weatherLabel(73).text).toBe("雪");
    expect(weatherLabel(95).text).toBe("雷雨");
  });
  it("未知のコードでも落ちない", () => {
    expect(weatherLabel(999).text).toBe("不明");
  });
});

describe("needsUmbrella", () => {
  it("雨・雷雨なら雨具を促す", () => {
    expect(needsUmbrella(63, 30)).toBe(true);
    expect(needsUmbrella(95, 10)).toBe(true);
  });
  it("晴れでも降水確率が高ければ促す", () => {
    expect(needsUmbrella(1, 60)).toBe(true);
  });
  it("晴れで降水確率が低ければ促さない", () => {
    expect(needsUmbrella(1, 10)).toBe(false);
    expect(needsUmbrella(0, null)).toBe(false);
  });
});

describe("isForecastable(予報が出せる範囲か)", () => {
  it("今日から15日先までは対象", () => {
    expect(isForecastable("2026-07-29", "2026-07-29")).toBe(true);
    expect(isForecastable("2026-08-13", "2026-07-29")).toBe(true);
  });
  it("16日以上先・過去は対象外", () => {
    expect(isForecastable("2026-08-20", "2026-07-29")).toBe(false);
    expect(isForecastable("2026-07-28", "2026-07-29")).toBe(false);
  });
});

describe("parseForecast(応答の読み取り)", () => {
  it("必要な値を取り出す", () => {
    const json = {
      daily: {
        weather_code: [61],
        temperature_2m_max: [31.4],
        temperature_2m_min: [24.2],
        precipitation_probability_max: [70],
      },
    };
    expect(parseForecast(json)).toEqual({
      code: 61,
      tempMax: 31.4,
      tempMin: 24.2,
      precipitation: 70,
    });
  });

  it("想定外の形でも落ちずに null を返す", () => {
    expect(parseForecast(null)).toBeNull();
    expect(parseForecast({})).toBeNull();
    expect(parseForecast({ daily: {} })).toBeNull();
    expect(parseForecast({ daily: { weather_code: ["雨"] } })).toBeNull();
  });

  it("一部の値が欠けていても天気コードがあれば使う", () => {
    expect(parseForecast({ daily: { weather_code: [0] } })).toEqual({
      code: 0,
      tempMax: null,
      tempMin: null,
      precipitation: null,
    });
  });
});

describe("forecastUrl", () => {
  it("対象日だけを指定した URL を作る", () => {
    const url = forecastUrl(CITIES[5], "2026-08-10");
    expect(url).toContain("start_date=2026-08-10");
    expect(url).toContain("end_date=2026-08-10");
    expect(url).toContain("timezone=Asia%2FTokyo");
    expect(url.startsWith("https://api.open-meteo.com/")).toBe(true);
  });
});
