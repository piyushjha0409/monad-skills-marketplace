"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Copy, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { type TemplateProfile } from "@/lib/templates";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then(setTemplates)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative bg-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="bg-grid bg-grid-fade absolute inset-0" />
        <div className="bg-grid-dots bg-grid-fade absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16 lg:max-w-4xl">
        <PageHeader
          title="App Templates"
          description="Production-style template skills you can use as a base to build fully fledged apps."
        />

        {!loading && (
          <p className="mt-2 text-xs text-gray-400 sm:text-sm">
            {templates.length} {templates.length === 1 ? "template" : "templates"} available
          </p>
        )}

        <div className="mt-6 grid items-start gap-4 sm:mt-8 md:grid-cols-2">
          {loading
            ? Array.from({ length: 1 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-lg bg-amber-50" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        <div className="h-3 w-20 animate-pulse rounded bg-gray-50" />
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      <div className="h-3 w-full animate-pulse rounded bg-gray-50" />
                      <div className="h-3 w-2/3 animate-pulse rounded bg-gray-50" />
                    </div>
                  </div>
                </div>
              ))
            : templates.map((template) => (
            <section
              key={template.slug}
              className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/80 hover:-translate-y-0.5"
            >
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <Link href={`/templates/${template.slug}`} className="flex items-center gap-3 group/link">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                    <FolderOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 transition-colors group-hover/link:text-amber-600 sm:text-[0.9rem]">
                      {template.meta.name}
                    </h3>
                    <p className="text-[11px] text-gray-400">{template.slug}/</p>
                  </div>
                </Link>

                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-amber-50 px-2 py-[2px] text-[10px] font-medium text-amber-600">
                    {template.meta.category}
                  </span>
                  <span className="rounded-md bg-amber-50 px-2 py-[2px] text-[10px] font-medium text-amber-600">
                    {template.meta.difficulty}
                  </span>
                </div>

                <p className="mt-3 line-clamp-2 text-[0.8rem] leading-[1.6] text-gray-500">{template.meta.description}</p>

                <div className="mt-3">
                  <p className="text-[11px] font-medium text-gray-500">Included files</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {template.files.map((file) => (
                      <span
                        key={file}
                        className="rounded-md bg-gray-50 px-2 py-[3px] text-[10px] font-medium text-gray-500 sm:text-[11px]"
                      >
                        {file}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {template.meta.skills.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-gray-50 px-2 py-[3px] text-[10px] font-medium text-gray-500 sm:text-[11px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center border-t border-gray-200 px-4 py-2 sm:px-5">
                <button className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-gray-400 transition-all hover:bg-amber-50 hover:text-amber-600">
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </button>
                <button className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-gray-400 transition-all hover:bg-amber-50 hover:text-amber-600">
                  <Download className="h-3 w-3" />
                  <span>Download</span>
                </button>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
          <Link
            href="/tutorial"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-600 px-5 text-sm font-semibold text-white transition-all hover:bg-amber-500"
          >
            Read skill guide
          </Link>
          <Link
            href="/browse"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-5 text-sm font-medium text-gray-600 transition-all hover:bg-gray-50"
          >
            Browse live skills
          </Link>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}
