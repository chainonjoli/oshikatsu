import { beforeEach, describe, expect, it } from "vitest";

// localStorage を持つ window をテスト用に用意
const storage = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  value: {
    localStorage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
      removeItem: (k: string) => storage.delete(k),
    },
  },
  writable: true,
});

import {
  addChecklist,
  addEvent,
  addTrip,
  checklistProgress,
  clearAllData,
  deleteEvent,
  exportData,
  importData,
  itemsOf,
  saveOshi,
  toggleItem,
  tripByEvent,
  upcomingDeadlines,
} from "../store";
import { todayJST } from "../dates";

// 各テストを空の状態から始める
beforeEach(() => {
  clearAllData();
});

function loadData() {
  return JSON.parse(exportData());
}

describe("store(ローカル保存)", () => {
  it("推しを保存・更新できる", () => {
    saveOshi({ group_name: "King & Prince", member_name: "永瀬廉", color: "#00A2C7", fan_since: null, memo: "" });
    expect(loadData().oshi.member_name).toBe("永瀬廉");
    saveOshi({ group_name: "King & Prince", member_name: "髙橋海人", color: "#F76B15", fan_since: null, memo: "" });
    const d = loadData();
    expect(d.oshi.member_name).toBe("髙橋海人");
  });

  it("予定の登録と、削除時の紐づけ解除", () => {
    const eventId = addEvent({
      title: "テスト公演",
      category: "live",
      date: todayJST(),
      open_time: "16:00",
      start_time: "18:00",
      venue: "東京ドーム",
      seat: "",
      ticket_status: "none",
      weather_memo: "",
      friends_memo: "",
      emergency_contact: "",
      memo: "",
      source_note: "",
    });
    const tripId = addTrip({
      event_id: eventId,
      title: "遠征",
      origin: "名古屋",
      transport_type: "shinkansen",
      depart_time: "",
      arrive_time: "",
      return_memo: "",
      hotel_name: "",
      hotel_checkin: "",
      hotel_checkout: "",
      hotel_memo: "",
      cost_transport: 0,
      cost_hotel: 0,
      cost_ticket: 0,
      cost_goods: 0,
      cost_food: 0,
      cost_other: 0,
      schedule_json: "[]",
      memo: "",
    });
    expect(tripByEvent(loadData(), eventId)?.id).toBe(tripId);
    deleteEvent(eventId);
    const d = loadData();
    expect(d.events.length).toBe(0);
    expect(d.trips[0].event_id).toBeNull(); // プランは残り、紐づけだけ外れる
  });

  it("持ち物テンプレート16項目とチェック", () => {
    const listId = addChecklist("持ち物", null, true);
    let d = loadData();
    const items = itemsOf(d, listId);
    expect(items.length).toBe(16);
    expect(items[0].name).toBe("チケット");
    toggleItem(items[0].id);
    d = loadData();
    expect(checklistProgress(d, listId)).toEqual({ done: 1, total: 16 });
  });

  it("期限系カテゴリーだけが警告に出る", () => {
    const base = {
      open_time: "", start_time: "", venue: "", seat: "", ticket_status: "none",
      weather_memo: "", friends_memo: "", emergency_contact: "", memo: "", source_note: "",
    };
    addEvent({ ...base, title: "支払", category: "payment_deadline", date: todayJST() });
    addEvent({ ...base, title: "CD", category: "cd_dvd", date: todayJST() });
    const deadlines = upcomingDeadlines(loadData(), 7);
    expect(deadlines.length).toBe(1);
    expect(deadlines[0].title).toBe("支払");
  });

  it("バックアップの書き出しと読み込み", () => {
    saveOshi({ group_name: "G", member_name: "M", color: "#E93D82", fan_since: null, memo: "" });
    const backup = exportData();
    clearAllData();
    expect(loadData().oshi).toBeNull();
    expect(importData(backup)).toBe(true);
    expect(loadData().oshi.member_name).toBe("M");
    expect(importData("壊れたJSON")).toBe(false);
  });
});
