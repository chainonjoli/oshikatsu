// ローカル保存(ブラウザ内)方式のデータ型

export type Oshi = {
  id: string;
  genre: string;
  group_name: string;
  member_name: string;
  color: string;
  fan_since: string | null;
  memo: string;
  created_at: string;
  updated_at: string;
};

export type InfoSource = {
  id: string;
  label: string;
  url: string;
  note: string;
  /** true = リポジトリのJSONで配布しているリンク(ユーザーは削除できない) */
  builtin?: boolean;
};

export type EventRow = {
  id: string;
  title: string;
  category: string;
  date: string;
  open_time: string;
  start_time: string;
  venue: string;
  /** 天気予報を出す都市(weather.ts の CITIES の id)。未設定なら手動メモのみ */
  city?: string;
  seat: string;
  ticket_status: string;
  weather_memo: string;
  friends_memo: string;
  emergency_contact: string;
  memo: string;
  source_note: string;
  created_at: string;
  updated_at: string;
};

export type Trip = {
  id: string;
  event_id: string | null;
  title: string;
  origin: string;
  transport_type: string;
  depart_time: string;
  arrive_time: string;
  return_memo: string;
  hotel_name: string;
  hotel_checkin: string;
  hotel_checkout: string;
  hotel_memo: string;
  cost_transport: number;
  cost_hotel: number;
  cost_ticket: number;
  cost_goods: number;
  cost_food: number;
  cost_other: number;
  schedule_json: string;
  memo: string;
  created_at: string;
  updated_at: string;
};

export type ScheduleEntry = { time: string; label: string };

export type Checklist = {
  id: string;
  event_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ChecklistItem = {
  id: string;
  checklist_id: string;
  name: string;
  checked: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AffiliateLink = {
  id: string;
  label: string;
  url: string;
  category: string;
  description: string;
  active: boolean;
};

export function tripTotal(t: Pick<
  Trip,
  "cost_transport" | "cost_hotel" | "cost_ticket" | "cost_goods" | "cost_food" | "cost_other"
>): number {
  return (
    t.cost_transport + t.cost_hotel + t.cost_ticket + t.cost_goods + t.cost_food + t.cost_other
  );
}

export function parseSchedule(json: string): ScheduleEntry[] {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => e && typeof e === "object")
      .map((e) => ({ time: String(e.time ?? ""), label: String(e.label ?? "") }))
      .filter((e) => e.time !== "" || e.label !== "");
  } catch {
    return [];
  }
}
