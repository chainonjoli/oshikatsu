"use client";

import Link from "next/link";
import { formatDateJaLong } from "@/lib/dates";
import { categoryOf, ticketStatusLabel, transportLabel } from "@/lib/constants";
import { parseSchedule } from "@/lib/types";
import type { Checklist, ChecklistItem, EventRow, Trip } from "@/lib/types";
import { toggleItem } from "@/lib/store";
import { Card, WarningCard } from "@/components/ui";
import WeatherPanel from "@/components/WeatherPanel";

type Props = {
  event: EventRow;
  trip: Trip | null;
  checklist: Checklist | null;
  items: ChecklistItem[];
  isToday: boolean;
};

function Row({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2.5" style={{ borderBottom: "1px solid var(--color-line)" }}>
      <span className="w-20 shrink-0 text-sm font-bold">
        {icon} {label}
      </span>
      <div className="min-w-0 flex-1 text-sm">{children}</div>
    </div>
  );
}

export default function LiveDayView({ event, trip, checklist, items, isToday }: Props) {
  const unchecked = items.filter((i) => !i.checked);
  const schedule = trip ? parseSchedule(trip.schedule_json) : [];

  const warnings: string[] = [];
  if (event.ticket_status === "none") warnings.push("チケット状況が「未確認」です");
  if (!event.seat) warnings.push("座席が未入力です");
  if (items.length === 0) warnings.push("持ち物リストがまだありません");
  if (unchecked.length > 0) warnings.push(`持ち物 ${unchecked.length}件が未チェックです`);

  return (
    <div className="space-y-4">
      {!isToday && (
        <p
          className="rounded-xl px-3 py-2 text-center text-xs font-bold"
          style={{ background: "#EEF2FF", color: "#3E63DD" }}
        >
          これはプレビュー表示です(当日ではありません)
        </p>
      )}

      {/* 公演ヘッダー */}
      <div
        className="rounded-2xl px-5 py-5 text-center"
        style={{ background: "var(--color-accent)", color: "var(--color-accent-text)" }}
      >
        <p className="text-xs opacity-90">{categoryOf(event.category).label}</p>
        <h1 className="mt-1 text-xl font-bold">{event.title}</h1>
        <p className="mt-2 text-sm font-semibold">{formatDateJaLong(event.date)}</p>
        <p className="mt-1 text-lg font-bold">
          {event.open_time && `開場 ${event.open_time}`}
          {event.open_time && event.start_time && " / "}
          {event.start_time && `開演 ${event.start_time}`}
          {!event.open_time && !event.start_time && "開演時間 未入力"}
        </p>
      </div>

      <WarningCard title="未完了があります" items={warnings} />

      <Card className="!py-1">
        <Row icon="🎫" label="チケット">
          <p>
            {event.seat ? (
              <span className="font-semibold">座席:{event.seat}</span>
            ) : (
              <span style={{ color: "var(--color-muted)" }}>座席 未入力</span>
            )}
            <span
              className="ml-2 rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={
                event.ticket_status === "none"
                  ? { background: "var(--color-warning-bg)", color: "var(--color-warning)" }
                  : { background: "#E8F7EF", color: "var(--color-ok)" }
              }
            >
              {ticketStatusLabel(event.ticket_status)}
            </span>
          </p>
        </Row>

        <Row icon="📍" label="会場">
          {event.venue ? (
            <p className="font-semibold">{event.venue}</p>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>未入力</p>
          )}
        </Row>

        <Row icon="🎒" label="持ち物">
          {checklist ? (
            <div>
              <p className="font-semibold">
                {items.length - unchecked.length} / {items.length} 完了
              </p>
              <ul className="mt-2 space-y-1.5">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="flex min-h-8 w-full items-center gap-2 text-left"
                    >
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold"
                        style={
                          item.checked
                            ? { background: "var(--color-ok)", borderColor: "var(--color-ok)", color: "#fff" }
                            : { borderColor: "var(--color-line)", color: "transparent" }
                        }
                      >
                        ✓
                      </span>
                      <span
                        className={item.checked ? "line-through" : ""}
                        style={item.checked ? { color: "var(--color-muted)" } : undefined}
                      >
                        {item.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <Link
                href={`/checklists/view/?id=${checklist.id}`}
                className="mt-2 inline-block text-xs font-bold"
                style={{ color: "var(--color-accent)" }}
              >
                リストを編集する →
              </Link>
            </div>
          ) : (
            <p>
              <span style={{ color: "var(--color-muted)" }}>この予定の持ち物リストはまだありません </span>
              <Link
                href={`/checklists/?event=${event.id}`}
                className="font-bold"
                style={{ color: "var(--color-accent)" }}
              >
                作成する →
              </Link>
            </p>
          )}
        </Row>

        <Row icon="🚄" label="交通">
          {trip && (trip.origin || trip.depart_time || trip.arrive_time) ? (
            <div>
              <p className="font-semibold">
                {trip.origin && `${trip.origin}発`} {transportLabel(trip.transport_type)}
              </p>
              {trip.depart_time && <p>出発:{trip.depart_time}</p>}
              {trip.arrive_time && <p>到着:{trip.arrive_time}</p>}
              {trip.return_memo && <p style={{ color: "var(--color-muted)" }}>帰り:{trip.return_memo}</p>}
            </div>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>未入力(遠征プランで登録できます)</p>
          )}
        </Row>

        <Row icon="🏨" label="宿泊">
          {trip && trip.hotel_name ? (
            <div>
              <p className="font-semibold">{trip.hotel_name}</p>
              <p>
                {trip.hotel_checkin && `IN ${trip.hotel_checkin}`}
                {trip.hotel_checkin && trip.hotel_checkout && " / "}
                {trip.hotel_checkout && `OUT ${trip.hotel_checkout}`}
              </p>
              {trip.hotel_memo && <p style={{ color: "var(--color-muted)" }}>{trip.hotel_memo}</p>}
            </div>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>未入力</p>
          )}
        </Row>

        <Row icon="☀️" label="天気">
          {event.city ? (
            <WeatherPanel cityId={event.city} date={event.date} />
          ) : (
            <p className="text-xs" style={{ color: "var(--color-muted)" }}>
              予定に会場の都市を設定すると、天気を自動表示できます
            </p>
          )}
          {event.weather_memo && (
            <p className="mt-1 text-sm">{event.weather_memo}</p>
          )}
          <a
            href="https://tenki.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs font-bold"
            style={{ color: "var(--color-accent)" }}
          >
            詳しい天気を見る(外部) →
          </a>
        </Row>

        <Row icon="👭" label="推し友">
          {event.friends_memo ? (
            <p className="font-semibold">{event.friends_memo}</p>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>集合メモ 未入力</p>
          )}
        </Row>

        <Row icon="🕐" label="行動予定">
          {schedule.length > 0 ? (
            <ul className="space-y-1">
              {schedule.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-12 shrink-0 font-bold">{s.time || "--:--"}</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>未入力(遠征プランで登録できます)</p>
          )}
        </Row>

        <Row icon="📞" label="緊急連絡">
          {event.emergency_contact ? (
            <p className="font-semibold">{event.emergency_contact}</p>
          ) : (
            <p style={{ color: "var(--color-muted)" }}>未入力</p>
          )}
        </Row>

        <div className="flex gap-3 py-2.5">
          <span className="w-20 shrink-0 text-sm font-bold">📝 メモ</span>
          <div className="min-w-0 flex-1 text-sm">
            {event.memo ? (
              <p className="whitespace-pre-wrap">{event.memo}</p>
            ) : (
              <p style={{ color: "var(--color-muted)" }}>未入力</p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2 text-center text-xs font-bold">
        <Link
          href={`/events/edit/?id=${event.id}`}
          className="rounded-xl border-2 py-2.5"
          style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
        >
          予定を編集する
        </Link>
        <Link
          href={trip ? `/trips/edit/?id=${trip.id}` : `/trips/new/?event=${event.id}`}
          className="rounded-xl border-2 py-2.5"
          style={{ borderColor: "var(--color-line)", color: "var(--color-accent)" }}
        >
          {trip ? "遠征プランを見る" : "遠征プランを作る"}
        </Link>
      </div>
    </div>
  );
}
