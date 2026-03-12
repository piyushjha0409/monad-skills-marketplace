"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
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
      .then((res) => res.json())
      .then((data) => setProfiles(data))
      .finally(() => setLoading(false));
  }, []);

  // #6 Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    profiles.forEach((p) => p.meta.skills.forEach((s) => tags.add(s)));
    return Array.from(tags).sort();
  }, [profiles]);

  // #6 Filter by search + tag
  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.meta.name.toLowerCase().includes(q) ||
        p.meta.description.toLowerCase().includes(q) ||
        p.meta.skills.some((s) => s.toLowerCase().includes(q));
      const matchesTag =
        !activeTag || p.meta.skills.includes(activeTag);
      return matchesSearch && matchesTag;
    });
  }, [profiles, search, activeTag]);

  return (
    <div className="relative h-full overflow-auto">
      {/* Background */}
      <Image
        src="/bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center -z-10 pointer-events-none fixed inset-0"
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-black/60" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      <div className="relative mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-14 lg:max-w-4xl lg:px-12">
        <PageHeader
          title="Skills Marketplace"
          description="Browse skill templates. Download the folder, drop it in your project, and start building."
        />

        <p className="mt-3 text-xs text-white/35 sm:mt-4 sm:text-sm">
          Not sure how to get started?{" "}
          <Link
            href="/tutorial"
            className="text-purple-400/80 underline underline-offset-2 transition-colors hover:text-purple-300"
          >
            Read the guide
          </Link>
        </p>

        {/* Divider */}
        <div className="mt-6 h-px bg-white/[0.06] sm:mt-8" />

        {/* #1 Skill count + #6 Search */}
        <div className="mt-5 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center sm:justify-between">
          {!loading && (
            <p className="text-xs text-white/30 sm:text-sm">
              {filtered.length} template{filtered.length !== 1 ? "s" : ""} available
              {activeTag && (
                <span className="text-white/20">
                  {" "}in <span className="text-purple-400/60">{activeTag}</span>
                </span>
              )}
            </p>
          )}

          {/* #6 Search input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03] pl-9 pr-8 text-sm text-white/80 placeholder:text-white/20 outline-none transition-colors focus:border-purple-500/30 focus:bg-white/[0.05]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* #6 Tag filter pills */}
        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors sm:text-xs ${
                !activeTag
                  ? "bg-purple-500/15 text-purple-400/90"
                  : "bg-white/[0.04] text-white/30 hover:bg-white/[0.07] hover:text-white/50"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors sm:text-xs ${
                  activeTag === tag
                    ? "bg-purple-500/15 text-purple-400/90"
                    : "bg-white/[0.04] text-white/30 hover:bg-white/[0.07] hover:text-white/50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="mt-6 grid gap-3 sm:gap-4 md:grid-cols-2">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-lg border border-white/[0.06] bg-[#1a1a2e]/90 p-4 backdrop-blur-md sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-md bg-white/[0.06]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-white/[0.06]" />
                      <div className="h-3 w-20 animate-pulse rounded bg-white/[0.04]" />
                    </div>
                  </div>
                  <div className="mt-3 h-3 w-full animate-pulse rounded bg-white/[0.04]" />
                  <div className="mt-1.5 h-3 w-3/4 animate-pulse rounded bg-white/[0.03]" />
                  <div className="mt-3 flex gap-1.5">
                    <div className="h-5 w-14 animate-pulse rounded-md bg-white/[0.04]" />
                    <div className="h-5 w-12 animate-pulse rounded-md bg-white/[0.04]" />
                    <div className="h-5 w-16 animate-pulse rounded-md bg-white/[0.04]" />
                  </div>
                </div>
              ))
            : filtered.map((profile) => (
                <SkillCard key={profile.slug} profile={profile} />
              ))}
        </div>

        {!loading && filtered.length === 0 && (
          <div className="mt-8 rounded-lg border border-white/[0.06] bg-[#1a1a2e]/90 p-10 text-center backdrop-blur-md sm:p-14">
            <p className="text-sm text-white/35">
              {profiles.length === 0
                ? "No skill templates available yet."
                : "No templates match your search."}
            </p>
            {(search || activeTag) && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveTag(null);
                }}
                className="mt-3 text-xs text-purple-400/70 underline underline-offset-2 transition-colors hover:text-purple-300"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
