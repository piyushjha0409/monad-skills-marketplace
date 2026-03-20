"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SkillCard } from "@/components/skills/skill-card";
import { type SkillProfile } from "@/lib/skills";
import { Search, X } from "lucide-react";

export default function BrowsePage() {
  const [profiles, setProfiles] = useState<SkillProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then(setProfiles)
      .finally(() => setLoading(false));
  }, []);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    profiles.forEach((p) => p.meta.skills.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.meta.name.toLowerCase().includes(q) ||
        p.meta.description.toLowerCase().includes(q) ||
        p.meta.skills.some((s) => s.toLowerCase().includes(q));
      const matchTag = !activeTag || p.meta.skills.includes(activeTag);
      return matchSearch && matchTag;
    });
  }, [profiles, search, activeTag]);

  return (
    <div className="relative h-full overflow-auto bg-white">
      {/* Animated grid */}
      <div className="pointer-events-none fixed inset-0">
        <div className="bg-grid bg-grid-fade absolute inset-0" />
        <div className="bg-grid-dots bg-grid-fade absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-16 lg:max-w-4xl">
        <PageHeader
          title="Skills Marketplace"
          description="Download a skill folder, drop it in your project, and start building."
        />

        <p className="mt-4 text-xs text-gray-400 sm:text-sm">
          New here?{" "}
          <Link
            href="/tutorial"
            className="font-medium text-purple-500 transition-colors hover:text-purple-600"
          >
            Read the guide
          </Link>
        </p>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          {!loading && (
            <p className="text-xs text-gray-500 sm:text-sm">
              {filtered.length}{" "}
              {filtered.length === 1 ? "template" : "templates"}
              {activeTag && (
                <span>
                  {" "}in <span className="font-medium text-purple-600">{activeTag}</span>
                </span>
              )}
            </p>
          )}

          <div className="relative w-full sm:max-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-800 placeholder:text-gray-300 outline-none transition-all focus:border-purple-300 focus:ring-2 focus:ring-purple-100"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 transition-colors hover:text-gray-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all sm:text-xs ${
                !activeTag
                  ? "bg-purple-100 text-purple-700"
                  : "text-gray-400 hover:bg-purple-50 hover:text-purple-600"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all sm:text-xs ${
                  activeTag === tag
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="mt-6 h-px bg-gray-100 sm:mt-8" />

        {/* Grid */}
        <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 animate-pulse rounded-lg bg-gray-100" />
                    <div className="flex-1 space-y-2.5 pt-0.5">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                      <div className="h-3 w-16 animate-pulse rounded bg-gray-50" />
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="h-3 w-full animate-pulse rounded bg-gray-50" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-gray-50" />
                  </div>
                </div>
              ))
            : filtered.map((p) => <SkillCard key={p.slug} profile={p} />)}
        </div>

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="mt-10 py-16 text-center">
            <p className="text-sm text-gray-400">
              {profiles.length === 0
                ? "No skill templates available yet."
                : "No templates match your search."}
            </p>
            {(search || activeTag) && (
              <button
                onClick={() => { setSearch(""); setActiveTag(null); }}
                className="mt-3 text-xs font-medium text-purple-500 transition-colors hover:text-purple-600"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
}
