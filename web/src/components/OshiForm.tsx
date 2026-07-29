"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COLOR_PALETTE, PRESET_GROUPS } from "@/lib/constants";
import { saveOshi } from "@/lib/store";
import type { Oshi } from "@/lib/types";
import { SubmitButton } from "./ui";

type Props = {
  initial?: Oshi | null;
  submitLabel: string;
  afterSavePath: string;
};

export default function OshiForm({ initial, submitLabel, afterSavePath }: Props) {
  const router = useRouter();
  const preset = PRESET_GROUPS[0];
  const initialGroup = initial?.group_name ?? preset.name;
  const isPresetGroup = initialGroup === preset.name;

  const [groupChoice, setGroupChoice] = useState(isPresetGroup ? preset.name : "__custom__");
  const [groupName, setGroupName] = useState(initialGroup);
  const [memberChoice, setMemberChoice] = useState(
    initial && preset.members.includes(initial.member_name) ? initial.member_name : "__custom__"
  );
  const [memberName, setMemberName] = useState(initial?.member_name ?? "");
  const [color, setColor] = useState(initial?.color ?? COLOR_PALETTE[1].hex);
  const [fanSince, setFanSince] = useState(initial?.fan_since ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [error, setError] = useState("");

  const usePreset = groupChoice === preset.name;
  const memberIsCustom = !usePreset || memberChoice === "__custom__";
  const effectiveGroup = usePreset ? preset.name : groupName.trim();
  const effectiveMember = (memberIsCustom ? memberName : memberChoice).trim();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!effectiveGroup || effectiveGroup.length > 50) {
      setError("グループ名を入力してください(50文字まで)");
      return;
    }
    if (!effectiveMember || effectiveMember.length > 50) {
      setError("推しの名前を入力してください(50文字まで)");
      return;
    }
    saveOshi({
      group_name: effectiveGroup,
      member_name: effectiveMember,
      color,
      fan_since: fanSince || null,
      memo: memo.trim(),
    });
    router.push(afterSavePath);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p
          className="rounded-xl border-l-4 px-4 py-3 text-sm font-semibold"
          style={{
            background: "var(--color-warning-bg)",
            borderColor: "var(--color-warning)",
            color: "var(--color-warning)",
          }}
        >
          {error}
        </p>
      )}

      <div>
        <label>グループ</label>
        <div className="flex gap-2">
          {[preset.name, "__custom__"].map((choice) => (
            <button
              key={choice}
              type="button"
              onClick={() => {
                setGroupChoice(choice);
                if (choice !== preset.name && groupName === preset.name) setGroupName("");
              }}
              className="flex-1 rounded-xl border-2 px-3 py-3 text-sm font-bold"
              style={
                groupChoice === choice
                  ? { borderColor: "var(--color-accent)", color: "var(--color-accent)", background: "#fff" }
                  : { borderColor: "var(--color-line)", color: "var(--color-muted)", background: "#fff" }
              }
            >
              {choice === "__custom__" ? "その他(自由入力)" : choice}
            </button>
          ))}
        </div>
        {!usePreset && (
          <input
            type="text"
            className="mt-2"
            placeholder="グループ名・アーティスト名など"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            maxLength={50}
          />
        )}
      </div>

      <div>
        <label>推しの名前</label>
        {usePreset && (
          <div className="mb-2 flex flex-wrap gap-2">
            {[...preset.members, "__custom__"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMemberChoice(m)}
                className="rounded-full border-2 px-4 py-2 text-sm font-bold"
                style={
                  memberChoice === m
                    ? { borderColor: "var(--color-accent)", color: "var(--color-accent)", background: "#fff" }
                    : { borderColor: "var(--color-line)", color: "var(--color-muted)", background: "#fff" }
                }
              >
                {m === "__custom__" ? "自由入力" : m}
              </button>
            ))}
          </div>
        )}
        {memberIsCustom && (
          <input
            type="text"
            placeholder="推しの名前"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            maxLength={50}
          />
        )}
      </div>

      <div>
        <label>テーマカラー(あなたが選ぶ色)</label>
        <div className="grid grid-cols-5 gap-2">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => setColor(c.hex)}
              aria-label={c.name}
              className="flex flex-col items-center gap-1 rounded-xl p-1.5"
              style={color === c.hex ? { outline: "2px solid var(--color-accent)" } : undefined}
            >
              <span
                className="block h-9 w-9 rounded-full"
                style={{ background: c.hex, border: "1px solid rgba(0,0,0,0.1)" }}
              />
              <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="fan_since">ファンになった日(任意)</label>
        <input
          type="date"
          id="fan_since"
          value={fanSince}
          onChange={(e) => setFanSince(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="memo">自由メモ(任意)</label>
        <textarea
          id="memo"
          rows={2}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          maxLength={500}
          placeholder="好きなところ、推し活の目標など"
        />
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
