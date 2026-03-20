"use client";

import { useState } from "react";
import { type SkillProfile } from "@/lib/skills";
import { Download, FolderOpen, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

export function SkillCard({ profile }: { profile: SkillProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleDownload() {
    const skillBlob = new Blob([profile.skillMd], { type: "text/markdown" });
    const skillUrl = URL.createObjectURL(skillBlob);
    const a = document.createElement("a");
    a.href = skillUrl;
    a.download = `${profile.slug}-SKILL.md`;
    a.click();
    URL.revokeObjectURL(skillUrl);

    if (profile.readmeMd) {
      setTimeout(() => {
        const readmeBlob = new Blob([profile.readmeMd], { type: "text/markdown" });
        const readmeUrl = URL.createObjectURL(readmeBlob);
        const b = document.createElement("a");
        b.href = readmeUrl;
        b.download = `${profile.slug}-README.md`;
        b.click();
        URL.revokeObjectURL(readmeUrl);
      }, 100);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(profile.skillMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:border-purple-200 hover:shadow-md hover:shadow-purple-50">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
            <FolderOpen className="h-[18px] w-[18px]" />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="text-[0.9rem] font-semibold leading-tight text-gray-900">
              {profile.meta.name}
            </h3>
            <p className="mt-1 text-xs text-gray-400">
              {profile.slug}/
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-purple-50 hover:text-purple-500 active:text-purple-600"
              title="Copy SKILL.md"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-all hover:bg-purple-50 hover:text-purple-500 active:text-purple-600"
              title="Download folder"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {profile.meta.description && (
          <p className="mt-4 line-clamp-2 text-[0.8rem] leading-[1.6] text-gray-500">
            {profile.meta.description}
          </p>
        )}

        {/* Tags */}
        {profile.meta.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.meta.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-purple-50 px-2 py-[3px] text-[10px] font-semibold text-purple-600 sm:text-[11px]"
              >
                {skill}
              </span>
            ))}
            {profile.meta.skills.length > 5 && (
              <span className="px-1 py-[3px] text-[10px] text-gray-400 sm:text-[11px]">
                +{profile.meta.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Preview toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-center gap-1.5 border-t border-gray-50 py-2.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-purple-50/50 hover:text-purple-500 sm:text-xs"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Hide" : "Preview"}
      </button>

      {/* Preview panel */}
      {expanded && (
        <div className="border-t border-gray-50 p-5 sm:p-6">
          <pre className="max-h-72 overflow-auto rounded-lg bg-gray-50 p-4 font-mono text-[11px] leading-[1.7] text-gray-600 sm:text-xs">
            <code>{profile.skillMd}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
