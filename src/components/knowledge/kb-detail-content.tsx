"use client";

import { useState } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type KnowledgeBase } from "@/lib/knowledge-bases";
import { CopyCommand } from "@/components/shared/copy-command";
import { ChevronLeft, Download, Link2, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";

export function KBDetailContent({ kb }: { kb: KnowledgeBase }) {
  const [urlCopied, setUrlCopied] = useState(false);

  const pageUrl = typeof window !== "undefined"
    ? `${window.location.origin}/knowledge/${kb.slug}`
    : `/knowledge/${kb.slug}`;

  const rawUrl = typeof window !== "undefined"
    ? `${window.location.origin}/knowledge/${kb.slug}/raw`
    : `/knowledge/${kb.slug}/raw`;

  async function handleCopyUrl() {
    await navigator.clipboard.writeText(rawUrl);
    setUrlCopied(true);
    toast.success("Agent URL copied to clipboard");
    setTimeout(() => setUrlCopied(false), 2000);
  }

  function handleDownload() {
    toast.info(`Downloading ${kb.slug}-KB.md...`);
    const blob = new Blob([kb.kbMd], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kb.slug}-KB.md`;
    a.click();
    URL.revokeObjectURL(url);
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
          href="/knowledge"
          className="mb-6 inline-flex items-center gap-1 text-xs text-gray-400 transition-colors hover:text-purple-500 sm:text-sm"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Knowledge Base
        </Link>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600">
                {kb.meta.category}
              </span>
              <span className="rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400">
                v{kb.meta.version}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-[-0.02em] text-gray-900 sm:text-3xl">
              {kb.meta.name}
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-gray-500 sm:text-base">
              {kb.meta.description}
            </p>

            {/* KB.md — rendered as a file document */}
            <div className="mt-8 rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
                <BookOpen className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-700">KB.md</span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="prose prose-sm prose-gray max-w-none overflow-hidden prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-700 prose-code:rounded prose-code:bg-purple-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-purple-600 prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none prose-pre:overflow-x-auto prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-th:text-gray-700 prose-td:text-gray-600">
                  <Markdown remarkPlugins={[remarkGfm]}>{kb.body}</Markdown>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full shrink-0 lg:w-72">
            <div className="sticky top-20 space-y-4">
              {/* Agent URL — primary action */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-purple-600">
                  Agent Fetch URL
                </p>
                <p className="mb-3 text-xs text-purple-600/70">
                  Point your AI agent to this URL to give it this knowledge instantly.
                </p>
                <button
                  onClick={handleCopyUrl}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-purple-500"
                >
                  {urlCopied ? (
                    <><Check className="h-4 w-4" /> Copied</>
                  ) : (
                    <><Link2 className="h-4 w-4" /> Copy Agent URL</>
                  )}
                </button>
              </div>

              {/* Download */}
              <button
                onClick={handleDownload}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-purple-100 text-sm font-semibold text-purple-700 transition-all hover:bg-purple-600 hover:text-white"
              >
                <Download className="h-4 w-4" />
                Download KB.md
              </button>

              {/* Install command */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Add to project
                </p>
                <CopyCommand command={`curl -o ${kb.slug}.md ${rawUrl}`} />
              </div>

              {/* Metadata */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <dl className="space-y-3 text-sm">
                  {kb.meta.author && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Author</dt>
                      <dd className="font-medium text-gray-700">{kb.meta.author}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Category</dt>
                    <dd className="font-medium text-gray-700">{kb.meta.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Version</dt>
                    <dd className="font-medium text-gray-700">{kb.meta.version}</dd>
                  </div>
                </dl>

                {kb.meta.tags.length > 0 && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {kb.meta.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-gray-50 px-2 py-[3px] text-[11px] font-medium text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Files */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  File
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="h-3.5 w-3.5 text-purple-400" />
                  KB.md
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
