// 天気予報(Open-Meteo)。APIキー不要・ブラウザから直接取得できる公共データ。
// 取得できないときは必ず手動メモにフォールバックし、当日モードを壊さない。

export type City = { id: string; label: string; lat: number; lon: number };

/** ライブ・舞台が行われることの多い都市 */
export const CITIES: City[] = [
  { id: "sapporo", label: "札幌", lat: 43.06, lon: 141.35 },
  { id: "sendai", label: "仙台", lat: 38.27, lon: 140.87 },
  { id: "niigata", label: "新潟", lat: 37.92, lon: 139.04 },
  { id: "saitama", label: "さいたま", lat: 35.86, lon: 139.65 },
  { id: "chiba", label: "千葉", lat: 35.61, lon: 140.12 },
  { id: "tokyo", label: "東京", lat: 35.69, lon: 139.69 },
  { id: "yokohama", label: "横浜", lat: 35.44, lon: 139.64 },
  { id: "shizuoka", label: "静岡", lat: 34.98, lon: 138.38 },
  { id: "nagoya", label: "名古屋", lat: 35.18, lon: 136.91 },
  { id: "kyoto", label: "京都", lat: 35.01, lon: 135.77 },
  { id: "osaka", label: "大阪", lat: 34.69, lon: 135.5 },
  { id: "kobe", label: "神戸", lat: 34.69, lon: 135.2 },
  { id: "hiroshima", label: "広島", lat: 34.39, lon: 132.46 },
  { id: "fukuoka", label: "福岡", lat: 33.59, lon: 130.4 },
  { id: "naha", label: "那覇", lat: 26.21, lon: 127.68 },
];

export function cityById(id: string | undefined): City | null {
  if (!id) return null;
  return CITIES.find((c) => c.id === id) ?? null;
}

/** 気象庁・WMOの天気コードを日本語表記に変換 */
export function weatherLabel(code: number): { icon: string; text: string } {
  if (code === 0) return { icon: "☀️", text: "快晴" };
  if (code === 1) return { icon: "🌤️", text: "晴れ" };
  if (code === 2) return { icon: "⛅", text: "晴れ時々くもり" };
  if (code === 3) return { icon: "☁️", text: "くもり" };
  if (code === 45 || code === 48) return { icon: "🌫️", text: "霧" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", text: "霧雨" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", text: "雨" };
  if (code >= 71 && code <= 77) return { icon: "❄️", text: "雪" };
  if (code >= 80 && code <= 82) return { icon: "🌦️", text: "にわか雨" };
  if (code === 85 || code === 86) return { icon: "🌨️", text: "にわか雪" };
  if (code >= 95 && code <= 99) return { icon: "⛈️", text: "雷雨" };
  return { icon: "🌡️", text: "不明" };
}

/** 傘が必要そうかの目安(降水確率と天気コードから) */
export function needsUmbrella(code: number, precipitation: number | null): boolean {
  const rainy =
    (code >= 51 && code <= 67) || (code >= 80 && code <= 86) || (code >= 95 && code <= 99);
  return rainy || (precipitation !== null && precipitation >= 50);
}

export type Forecast = {
  code: number;
  tempMax: number | null;
  tempMin: number | null;
  precipitation: number | null;
};

/** 予報が出せる範囲か(Open-Meteo の予報は約16日先まで) */
export function isForecastable(date: string, today: string): boolean {
  const diff = Math.round(
    (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000
  );
  return diff >= 0 && diff <= 15;
}

/** APIの応答から必要な値だけ取り出す(想定外の形でも落ちないようにする) */
export function parseForecast(json: unknown): Forecast | null {
  const daily = (json as { daily?: Record<string, unknown[]> })?.daily;
  if (!daily) return null;
  const code = daily.weather_code?.[0];
  if (typeof code !== "number") return null;
  const num = (v: unknown) => (typeof v === "number" ? v : null);
  return {
    code,
    tempMax: num(daily.temperature_2m_max?.[0]),
    tempMin: num(daily.temperature_2m_min?.[0]),
    precipitation: num(daily.precipitation_probability_max?.[0]),
  };
}

export function forecastUrl(city: City, date: string): string {
  const params = new URLSearchParams({
    latitude: String(city.lat),
    longitude: String(city.lon),
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "Asia/Tokyo",
    start_date: date,
    end_date: date,
  });
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

/** 天気を取得。失敗したら null(呼び出し側で手動メモにフォールバック) */
export async function fetchForecast(city: City, date: string): Promise<Forecast | null> {
  try {
    const res = await fetch(forecastUrl(city, date));
    if (!res.ok) return null;
    return parseForecast(await res.json());
  } catch {
    return null;
  }
}
