// 表側の見せ方は King & Prince ファン向け、内部データは汎用。
// プリセットはコード側の「初期候補」であり、DBスキーマはグループ非依存。

export const APP_NAME = "オシカツOS";
export const APP_TAGLINE = "推し活に必要なすべてを、スマホ1つで。";

// 標準登録候補(グループ名・メンバー名はユーザーが自由に変更可能)
// 権利配慮:メンバーカラーの初期値は設定しない(色はユーザー自身が選ぶ)
export const PRESET_GROUPS: { name: string; members: string[] }[] = [
  { name: "King & Prince", members: ["永瀬廉", "髙橋海人"] },
];

// テーマカラーパレット(色名のみで提示)
export const COLOR_PALETTE: { name: string; hex: string }[] = [
  { name: "レッド", hex: "#E5484D" },
  { name: "ピンク", hex: "#E93D82" },
  { name: "オレンジ", hex: "#F76B15" },
  { name: "イエロー", hex: "#D9A400" },
  { name: "グリーン", hex: "#30A46C" },
  { name: "スカイブルー", hex: "#00A2C7" },
  { name: "ブルー", hex: "#3E63DD" },
  { name: "パープル", hex: "#8E4EC6" },
  { name: "ラベンダー", hex: "#9B8AC4" },
  { name: "ブラック", hex: "#3D3A3E" },
];

export type EventCategory =
  | "live"
  | "stage"
  | "tv"
  | "radio"
  | "magazine"
  | "cd_dvd"
  | "goods"
  | "streaming"
  | "fc_deadline"
  | "ticket_deadline"
  | "lottery_result"
  | "payment_deadline"
  | "hotel_cancel_deadline"
  | "other";

export const EVENT_CATEGORIES: {
  value: EventCategory;
  label: string;
  color: string;
  isDeadline: boolean;
}[] = [
  { value: "live", label: "ライブ", color: "#E93D82", isDeadline: false },
  { value: "stage", label: "舞台", color: "#8E4EC6", isDeadline: false },
  { value: "tv", label: "テレビ出演", color: "#3E63DD", isDeadline: false },
  { value: "radio", label: "ラジオ出演", color: "#00A2C7", isDeadline: false },
  { value: "streaming", label: "配信", color: "#0090FF", isDeadline: false },
  { value: "magazine", label: "雑誌発売", color: "#30A46C", isDeadline: false },
  { value: "cd_dvd", label: "CD・DVD・BD発売", color: "#12A594", isDeadline: false },
  { value: "goods", label: "グッズ発売", color: "#D9A400", isDeadline: false },
  { value: "fc_deadline", label: "FC申込期限", color: "#E5484D", isDeadline: true },
  { value: "ticket_deadline", label: "チケット申込期限", color: "#E5484D", isDeadline: true },
  { value: "lottery_result", label: "当落発表", color: "#E5484D", isDeadline: true },
  { value: "payment_deadline", label: "支払期限", color: "#E5484D", isDeadline: true },
  { value: "hotel_cancel_deadline", label: "ホテルキャンセル期限", color: "#E5484D", isDeadline: true },
  { value: "other", label: "その他", color: "#8E8A92", isDeadline: false },
];

export const DEADLINE_CATEGORIES = EVENT_CATEGORIES.filter((c) => c.isDeadline).map(
  (c) => c.value
);

export const LIVE_DAY_CATEGORIES: EventCategory[] = ["live", "stage"];

export function categoryOf(value: string) {
  return (
    EVENT_CATEGORIES.find((c) => c.value === value) ??
    EVENT_CATEGORIES[EVENT_CATEGORIES.length - 1]
  );
}

export type TicketStatus =
  | "none"
  | "before_apply"
  | "applied"
  | "won"
  | "lost"
  | "paid"
  | "issued";

export const TICKET_STATUSES: { value: TicketStatus; label: string }[] = [
  { value: "none", label: "未確認" },
  { value: "before_apply", label: "申込前" },
  { value: "applied", label: "申込済" },
  { value: "won", label: "当選" },
  { value: "lost", label: "落選" },
  { value: "paid", label: "支払済" },
  { value: "issued", label: "発券済" },
];

export function ticketStatusLabel(value: string) {
  return TICKET_STATUSES.find((s) => s.value === value)?.label ?? "未確認";
}

export const TRANSPORT_TYPES: { value: string; label: string }[] = [
  { value: "shinkansen", label: "新幹線" },
  { value: "airplane", label: "飛行機" },
  { value: "bus", label: "高速バス" },
  { value: "train", label: "電車" },
  { value: "car", label: "車" },
  { value: "other", label: "その他" },
];

export function transportLabel(value: string) {
  return TRANSPORT_TYPES.find((t) => t.value === value)?.label ?? "その他";
}

// 持ち物チェックリストの標準テンプレート
export const CHECKLIST_TEMPLATE: string[] = [
  "チケット",
  "スマートフォン",
  "モバイルバッテリー",
  "身分証明書",
  "ファンクラブ会員証",
  "現金",
  "クレジットカード",
  "交通チケット",
  "ペンライト",
  "うちわ",
  "双眼鏡",
  "タオル",
  "着替え",
  "化粧品",
  "常備薬",
  "雨具",
];

export type AffiliateCategory = "hotel" | "transport" | "goods" | "media" | "other";

export const AFFILIATE_CATEGORIES: { value: AffiliateCategory; label: string }[] = [
  { value: "hotel", label: "ホテル・宿泊" },
  { value: "transport", label: "交通(新幹線・飛行機・バス)" },
  { value: "goods", label: "持ち物・推し活グッズ" },
  { value: "media", label: "CD・DVD・雑誌・書籍" },
  { value: "other", label: "その他" },
];

// 予算項目(遠征プランナー)
export const BUDGET_FIELDS: { key: string; label: string }[] = [
  { key: "cost_transport", label: "移動費" },
  { key: "cost_hotel", label: "宿泊費" },
  { key: "cost_ticket", label: "チケット代" },
  { key: "cost_goods", label: "グッズ予算" },
  { key: "cost_food", label: "食費" },
  { key: "cost_other", label: "その他" },
];
