"use client";
import Link from "next/link";
import { useState } from "react";
import { SECTION_LABEL, TAXONOMY, type Section } from "@/lib/types";
export function PracticeSetPicker({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const [subject, setSubject] = useState<Section>("math");
  const [skill, setSkill] = useState("");
  const groups = TAXONOMY[subject];
  const selected =
    skill ||
    groups.flatMap((group) => group.skills).find((name) => counts[name]) ||
    "";
  const n = Math.min(5, counts[selected] || 0);
  const query = new URLSearchParams({
    section: subject,
    skill: selected,
    limit: String(n),
  });
  return (
    <div className="set-picker">
      <div className="subject-choices">
        {(["math", "rw"] as const).map((s) => (
          <button
            key={s}
            aria-pressed={subject === s}
            onClick={() => {
              setSubject(s);
              setSkill("");
            }}
          >
            {SECTION_LABEL[s]}
          </button>
        ))}
      </div>
      <label>
        Choose a skill
        <select value={selected} onChange={(e) => setSkill(e.target.value)}>
          {groups.map((group) => (
            <optgroup key={group.domain} label={group.domain}>
              {group.skills
                .filter((name) => counts[name])
                .map((name) => (
                  <option key={name}>{name}</option>
                ))}
            </optgroup>
          ))}
        </select>
      </label>
      {n > 0 && (
        <Link href={"/practice/play?" + query.toString()} className="set-start">
          Practice {n} questions →
        </Link>
      )}
    </div>
  );
}
