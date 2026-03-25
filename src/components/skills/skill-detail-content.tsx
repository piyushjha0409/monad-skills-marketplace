"use client";

import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type SkillProfile } from "@/lib/skills";
import { DIFFICULTY_CONFIG } from "@/lib/constants";
import { CopyCommand } from "@/components/shared/copy-command";
import { Download, ChevronLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { downloadSkillZip } from "@/lib/download";

export function SkillDetailContent({ profile }: { profile: SkillProfile }) {
  const diffConfig = DIFFICULTY_CONFIG[profile.meta.difficulty] || DIFFICULTY_CONFIG.intermediate;

  async function handleDownload() {
    toast.info(`Downloading ${profile.slug}.zip...`);
    await downloadSkillZip(profile.slug, profile.skillMd, profile.readmeMd);
  }

  return (
    <div className="relative bg-white">
      {/* Animated grid */}
      <div className="pointer-events-none fixed inset-0">
        <div className="bg-grid bg-grid-fade absolute inset-0" />
        <div className="bg-grid-dots bg-grid-fade absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12 lg:max-w-5xl">
        {/* Back */}
        <Link
          href="/browse"
          className="mb-6 inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-purple-500 sm:text-sm"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Browse
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-gray-900 sm:text-3xl">
              {profile.meta.name}
            </h1>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600">
                {profile.meta.category}
              </span>
              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${diffConfig.bg} ${diffConfig.text}`}>
                {diffConfig.label}
              </span>
              <span className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400">
                v{profile.meta.version}
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-gray-500 sm:text-base">
              {profile.meta.description}
            </p>

            {/* README.md — rendered as a proper README document */}
            {profile.readmeMd && (
              <div className="mt-8 rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">README.md</span>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="prose prose-sm prose-gray max-w-none overflow-hidden prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-700 prose-code:rounded prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-purple-600 prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none prose-pre:overflow-x-auto prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                    <Markdown remarkPlugins={[remarkGfm]}>{profile.readmeMd}</Markdown>
                  </div>
                </div>
              </div>
            )}

            {/* SKILL.md — rendered as a proper file document */}
            <div className="mt-6 rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                <FileText className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-700">SKILL.md</span>
                <span className="ml-auto text-[10px] text-gray-400">Agent Instructions</span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="prose prose-sm prose-gray max-w-none overflow-hidden prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-700 prose-code:rounded prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-purple-600 prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none prose-pre:overflow-x-auto prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200">
                  <Markdown remarkPlugins={[remarkGfm]}>{profile.body}</Markdown>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-72">
            <div className="sticky top-20 space-y-4">
              {/* Download button */}
              <button
                onClick={handleDownload}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-purple-100 text-sm font-semibold text-purple-700 transition-all hover:bg-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-200"
              >
                <Download className="h-4 w-4" />
                Download Skill
              </button>

              {/* Install command */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Install
                </p>
                <CopyCommand command={`cp -r ${profile.slug}/ .claude/skills/`} />
              </div>

              {/* Metadata */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <dl className="space-y-3 text-sm">
                  {profile.meta.author && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Author</dt>
                      <dd className="font-medium text-gray-700">{profile.meta.author}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Category</dt>
                    <dd className="font-medium text-gray-700">{profile.meta.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Difficulty</dt>
                    <dd className={`font-medium ${diffConfig.text}`}>{diffConfig.label}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Version</dt>
                    <dd className="font-medium text-gray-700">{profile.meta.version}</dd>
                  </div>
                </dl>

                {/* All tags */}
                {profile.meta.skills.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.meta.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-gray-50 px-2 py-[3px] text-[11px] font-medium text-gray-500"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Files included */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Files Included
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="h-3.5 w-3.5 text-purple-400" />
                    SKILL.md
                  </div>
                  {profile.readmeMd && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-3.5 w-3.5 text-purple-400" />
                      README.md
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
