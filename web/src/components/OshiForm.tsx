"use client";

import { useState } from "react";
import { COLOR_PALETTE, PRESET_GROUPS } from "@/lib/constants";
import { saveOshiAction } from "@/lib/actions/oshi";
import { SubmitButton } from "./ui";

type Props = {
  initial?: {
    group_name: string;
    member_name: string;
    color: string;
    fan_since: string | null;
    memo: string;
  } | null;
  backPath: string;
  submitLabel: string;
};

export default function OshiForm({ initial, backPath, submitLabel }: Props) {
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

  const usePreset = groupChoice === preset.name;
  const memberIsCustom = !usePreset || memberChoice === "__custom__";
  const effectiveMember = memberIsCustom ? memberName : memberChoice;

  return (
    <form action={saveOshiAction} className="space-y-5">
      <input type="hidden" name="back" value={backPath} />
      <input type="hidden" name="group_name" value={usePreset ? preset.name : groupName} />
      <input type="hidden" name="member_name" value={effectiveMember} />
      <input type="hidden" name="color" value={color} />

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
        <input type="date" id="fan_since" name="fan_since" defaultValue={initial?.fan_since ?? ""} />
      </div>

      <div>
        <label htmlFor="memo">自由メモ(任意)</label>
        <textarea id="memo" name="memo" rows={2} defaultValue={initial?.memo ?? ""} maxLength={500} placeholder="好きなところ、推し活の目標など" />
      </div>

      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
