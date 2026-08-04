"use client";

import { useEffect, useState } from "react";
import {
  cityById,
  fetchForecast,
  isForecastable,
  needsUmbrella,
  weatherLabel,
  type Forecast,
} from "@/lib/weather";
import { todayJST } from "@/lib/dates";

type State =
  | { kind: "loading" }
  | { kind: "ok"; forecast: Forecast }
  | { kind: "too-far" }
  | { kind: "unavailable" };

/**
 * 天気予報の自動表示。取得できない場合も必ず何かを表示し、
 * 当日モードが壊れないようにする。
 */
export default function WeatherPanel({ cityId, date }: { cityId: string; date: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const city = cityById(cityId);

  useEffect(() => {
    if (!city) return;
    if (!isForecastable(date, todayJST())) {
      setState({ kind: "too-far" });
      return;
    }
    let cancelled = false;
    setState({ kind: "loading" });
    fetchForecast(city, date).then((forecast) => {
      if (cancelled) return;
      setState(forecast ? { kind: "ok", forecast } : { kind: "unavailable" });
    });
    return () => {
      cancelled = true;
    };
  }, [city, date]);

  if (!city) return null;

  if (state.kind === "loading") {
    return (
      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        {city.label}の天気を確認しています…
      </p>
    );
  }

  if (state.kind === "too-far") {
    return (
      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        {city.label}の予報は、開催の約2週間前から表示されます
      </p>
    );
  }

  if (state.kind === "unavailable") {
    return (
      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        天気を取得できませんでした(通信環境をご確認ください)
      </p>
    );
  }

  const { forecast } = state;
  const w = weatherLabel(forecast.code);
  const umbrella = needsUmbrella(forecast.code, forecast.precipitation);

  return (
    <div>
      <p className="font-semibold">
        {w.icon} {city.label}:{w.text}
        {forecast.tempMax !== null && (
          <span className="ml-2 text-xs" style={{ color: "var(--color-muted)" }}>
            {forecast.tempMin !== null && `${Math.round(forecast.tempMin)}℃ / `}
            {Math.round(forecast.tempMax)}℃
          </span>
        )}
      </p>
      {forecast.precipitation !== null && (
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          降水確率 {forecast.precipitation}%
        </p>
      )}
      {umbrella && (
        <p className="mt-1 text-xs font-bold" style={{ color: "var(--color-warning)" }}>
          ☔ 雨具があると安心です
        </p>
      )}
    </div>
  );
}
