# 工程9:データベース設計

## 1. 設計方針

- **汎用設計**:King & Prince 固有の情報はデータではなく「プリセット(コード側の初期候補)」として持つ。テーブルは任意のグループ・ジャンルに対応
- **本人のみ閲覧**:ユーザーデータは全テーブルに `user_id` を持ち、全クエリで必須条件にする
- **将来拡張の予約**:通知・課金・共有・画像を後付けできる列/設計余地を確保
- ID は UUID(文字列)。日時は ISO8601 文字列(判定は Asia/Tokyo)

## 2. ER 概要

```
users 1─n oshis
users 1─n events ─┬─ 1─1 trips(任意)
                  └─ 1─n checklists 1─n checklist_items
users 1─n sessions
affiliate_links(運営データ・全ユーザー共通)
```

## 3. テーブル定義

### users
| 列 | 型 | 説明 |
|---|---|---|
| id | TEXT PK | UUID |
| email | TEXT UNIQUE | ログインID |
| password_hash | TEXT | scrypt ハッシュ(salt:hash) |
| display_name | TEXT | 表示名 |
| is_admin | INTEGER | 管理者フラグ(MVP:最初の登録者=1) |
| plan | TEXT | `free` / `premium`(**課金拡張用の予約列**。MVPは常に free) |
| created_at / updated_at | TEXT | |

### oshis(推し)
| 列 | 型 | 説明 |
|---|---|---|
| id | TEXT PK | |
| user_id | TEXT FK | |
| genre | TEXT | `idol` / `artist` / `actor` / `stage` / `sports` / `other`(**横展開用**。MVPのUIでは idol 固定) |
| group_name | TEXT | 例:King & Prince(自由入力可) |
| member_name | TEXT | 推しの名前 |
| color | TEXT | テーマカラー(HEX)。ユーザー選択 |
| image_path | TEXT NULL | **画像アップロード拡張用の予約列**(MVPは未使用) |
| fan_since | TEXT NULL | ファンになった日 |
| memo | TEXT | 自由メモ |
| created_at / updated_at | TEXT | |

### events(予定)
| 列 | 型 | 説明 |
|---|---|---|
| id | TEXT PK | |
| user_id | TEXT FK | |
| oshi_id | TEXT FK NULL | どの推しの予定か |
| title | TEXT | 公演名・予定名 |
| category | TEXT | 下記14種 |
| date | TEXT | YYYY-MM-DD |
| open_time / start_time | TEXT NULL | 開場/開演(HH:MM) |
| venue | TEXT | 会場 |
| seat | TEXT | 座席 |
| ticket_status | TEXT | `none`(未確認)/`before_apply`/`applied`/`won`/`lost`/`paid`/`issued` |
| weather_memo | TEXT | 天気メモ(手動) |
| friends_memo | TEXT | 推し友メモ(集合場所・時間) |
| emergency_contact | TEXT | 緊急連絡先メモ |
| memo | TEXT | 自由メモ |
| source_note | TEXT | **情報源メモ(出典明示用)** |
| created_at / updated_at | TEXT | |

category: `live` `stage` `tv` `radio` `magazine` `cd_dvd` `goods` `streaming` `fc_deadline` `ticket_deadline` `lottery_result` `payment_deadline` `hotel_cancel_deadline` `other`
期限系(警告対象): `fc_deadline` `ticket_deadline` `lottery_result` `payment_deadline` `hotel_cancel_deadline`

### trips(遠征プラン)
| 列 | 型 | 説明 |
|---|---|---|
| id | TEXT PK / user_id FK | |
| event_id | TEXT FK NULL UNIQUE | 紐づく予定(1予定1プラン) |
| title | TEXT | プラン名 |
| origin | TEXT | 出発地 |
| transport_type | TEXT | `shinkansen` `airplane` `bus` `train` `car` `other` |
| depart_time / arrive_time | TEXT | 出発・到着予定(自由書式) |
| return_memo | TEXT | 帰路メモ |
| hotel_name | TEXT / hotel_checkin / hotel_checkout | 宿泊 |
| hotel_memo | TEXT | |
| cost_transport / cost_hotel / cost_ticket / cost_goods / cost_food / cost_other | INTEGER | 円。合計はアプリ側で算出 |
| schedule_json | TEXT | 当日の行動予定 `[{"time":"15:00","label":"集合"}]` |
| memo | TEXT | |
| created_at / updated_at | TEXT | |

### checklists / checklist_items
| checklists | 説明 |
|---|---|
| id / user_id | |
| event_id TEXT FK NULL | 紐づく予定(イベントごとに保存) |
| title | リスト名 |
| created_at / updated_at | |

| checklist_items | 説明 |
|---|---|
| id / checklist_id | |
| name | 項目名 |
| checked | INTEGER 0/1 |
| sort_order | INTEGER |
| created_at / updated_at | |

### affiliate_links(運営データ)
| 列 | 説明 |
|---|---|
| id | |
| label | 表示名 |
| url | リンク先(ASP自由) |
| category | `hotel` / `transport` / `goods` / `media` / `other` |
| description | 説明文 |
| active | INTEGER 0/1 |
| sort_order | INTEGER |
| created_at / updated_at | |

### sessions
| 列 | 説明 |
|---|---|
| id | セッショントークン(ランダム) |
| user_id | |
| expires_at | 失効日時 |
| created_at | |

## 4. 将来拡張のためのスキーマ余地(実装しないが設計済み)

| 将来機能 | 追加方法(既存テーブル変更不要) |
|---|---|
| 通知 | `notifications(id, user_id, event_id, notify_at, channel, sent_at)` を追加 |
| 課金 | `users.plan` 切替+`subscriptions` テーブル追加 |
| グッズ管理 | `goods(id, user_id, oshi_id, name, category, price, ...)` を追加 |
| 推しノート | `memories(id, user_id, event_id, title, body, ...)` + `memory_photos` |
| 推し友共有 | `share_links(id, trip_id, token, shared_fields_json, expires_at)`(項目選択制) |
| 画像 | `oshis.image_path` 予約済み+ストレージ層追加 |
| 横展開 | `oshis.genre` 予約済み+ジャンル別プリセットをコード側に追加 |

## 5. インデックス

- `events(user_id, date)` / `checklists(user_id)` / `checklist_items(checklist_id)` / `trips(user_id)` / `sessions(user_id)` / `users(email)` UNIQUE
