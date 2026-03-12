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
    const skillLink = document.createElement("a");
    skillLink.href = skillUrl;
    skillLink.download = `${profile.slug}-SKILL.md`;
    skillLink.click();
    URL.revokeObjectURL(skillUrl);

    if (profile.readmeMd) {
      setTimeout(() => {
        const readmeBlob = new Blob([profile.readmeMd], { type: "text/markdown" });
        const readmeUrl = URL.createObjectURL(readmeBlob);
        const readmeLink = document.createElement("a");
        readmeLink.href = readmeUrl;
        readmeLink.download = `${profile.slug}-README.md`;
        readmeLink.click();
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
    <div className="group flex flex-col rounded-lg border border-white/[0.08] bg-[#1a1a2e]/90 backdrop-blur-md transition-all hover:border-purple-500/20 hover:bg-[#1e1e35]/95">
      {/* Main card content */}
      <div className="p-4 sm:p-5">
        {/* Top row: icon, name, actions */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-purple-500/[0.1] text-purple-400/80">
            <FolderOpen className="h-[1.125rem] w-[1.125rem]" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-white/90 sm:text-[0.95rem]">
              {profile.meta.name}
            </h3>
            <p className="mt-0.5 text-[11px] text-white/30 sm:text-xs">
              {profile.slug}/
            </p>
          </div>

          {/* Actions: copy + download */}
          <div className="flex shrink-0 gap-0.5">
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/25 transition-colors hover:bg-white/[0.08] hover:text-purple-400 sm:h-9 sm:w-9"
              title="Copy SKILL.md to clipboard"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/25 transition-colors hover:bg-white/[0.08] hover:text-purple-400 sm:h-9 sm:w-9"
              title="Download skill folder"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {profile.meta.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/35 sm:text-[0.8rem]">
            {profile.meta.description}
          </p>
        )}

        {/* Skill tags */}
        {profile.meta.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.meta.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-white/40 sm:text-[11px]"
              >
                {skill}
              </span>
            ))}
            {profile.meta.skills.length > 5 && (
              <span className="rounded-md bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/25 sm:text-[11px]">
                +{profile.meta.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* #2 Expand/preview toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-center gap-1.5 border-t border-white/[0.05] px-4 py-2 text-[11px] text-white/25 transition-colors hover:bg-white/[0.03] hover:text-white/45 sm:text-xs"
      >
        {expanded ? (
          <>
            <ChevronUp className="h-3 w-3" />
            Hide preview
          </>
        ) : (
          <>
            <ChevronDown className="h-3 w-3" />
            Preview SKILL.md
          </>
        )}
      </button>

      {/* #2 Expanded preview panel */}
      {expanded && (
        <div className="border-t border-white/[0.05] p-4 sm:p-5">
          <pre className="max-h-64 overflow-auto rounded-md bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-white/50 sm:p-4 sm:text-xs">
            <code>{profile.skillMd}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
