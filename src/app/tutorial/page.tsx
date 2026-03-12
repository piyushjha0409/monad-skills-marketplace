"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

const SECTIONS = [
  { id: "structure", label: "Structure" },
  { id: "skill-md", label: "SKILL.md" },
  { id: "readme-md", label: "README.md" },
  { id: "tips", label: "Tips" },
];

export default function TutorialPage() {
  const [showTop, setShowTop] = useState(false);
  const [activeSection, setActiveSection] = useState("structure");

  useEffect(() => {
    const container = document.getElementById("tutorial-scroll");
    if (!container) return;

    function onScroll() {
      setShowTop(container!.scrollTop > 300);

      // Update active section based on scroll position
      for (const section of [...SECTIONS].reverse()) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    }

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    document.getElementById("tutorial-scroll")?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div id="tutorial-scroll" className="h-full overflow-auto bg-[#0a0a0b]">
      {/* #5 Sticky section nav */}
      <div className="sticky top-0 z-20 border-b border-white/[0.05] bg-[#0a0a0b]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-1 px-5 py-2.5 sm:px-8 lg:max-w-3xl lg:px-12">
          <Link
            href="/browse"
            className="mr-3 flex items-center gap-1.5 text-xs text-white/30 transition-colors hover:text-white/50 sm:text-sm"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-4 w-px bg-white/[0.08]" />
          <div className="flex items-center gap-0.5 overflow-x-auto pl-2 sm:gap-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors sm:text-xs ${
                  activeSection === s.id
                    ? "bg-purple-500/15 text-purple-400/90"
                    : "text-white/30 hover:bg-white/[0.04] hover:text-white/50"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 py-8 sm:px-8 sm:py-14">
        <article className="mx-auto max-w-2xl lg:max-w-3xl">
          <h1 className="text-xl font-semibold tracking-[-0.01em] text-white sm:text-2xl md:text-3xl">
            How to create a skill folder
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-white/45 sm:mt-4 sm:text-base">
            Each skill is a <strong className="text-white/70">folder</strong> containing{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-purple-400/80 sm:text-sm">SKILL.md</code>{" "}
            and{" "}
            <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-purple-400/80 sm:text-sm">README.md</code>.
            This follows the open SKILL.md standard used by Claude Code, Codex,
            and other agent platforms.
          </p>

          {/* Divider */}
          <div className="mt-8 h-px bg-white/[0.06] sm:mt-10" />

          {/* Step 1 */}
          <section id="structure" className="scroll-mt-16 mt-8 sm:mt-10">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-500/[0.1] text-xs font-medium text-purple-400/80 sm:h-7 sm:w-7">
                1
              </span>
              <h2 className="text-base font-medium text-white/90 sm:text-lg">
                Folder structure
              </h2>
            </div>
            <p className="mt-3 text-sm text-white/40 sm:text-[0.9rem]">
              Create a folder for your skill inside your project&apos;s skills directory.
            </p>
            <pre className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-xs leading-relaxed text-white/60 overflow-x-auto sm:p-4 sm:text-sm">
              <code>{`your-project/
└── skills/
    └── solidity-developer/
        ├── SKILL.md      # Required — metadata + agent instructions
        └── README.md     # Human-readable description`}</code>
            </pre>
          </section>

          {/* Step 2 */}
          <section id="skill-md" className="scroll-mt-16 mt-10 sm:mt-12">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-500/[0.1] text-xs font-medium text-purple-400/80 sm:h-7 sm:w-7">
                2
              </span>
              <h2 className="text-base font-medium text-white/90 sm:text-lg">
                Create SKILL.md
              </h2>
            </div>
            <p className="mt-3 text-sm text-white/40 sm:text-[0.9rem]">
              The SKILL.md file has two parts: YAML frontmatter (metadata) and a
              markdown body (instructions for the agent).
            </p>

            <h3 className="mt-5 text-sm font-medium text-white/60 sm:mt-6 sm:text-[0.9rem]">Frontmatter</h3>
            <p className="mt-1.5 text-sm text-white/35 sm:text-[0.85rem]">
              Between <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-purple-400/80">---</code> delimiters.
              Required: <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-purple-400/80">name</code> (lowercase + hyphens, max 64 chars) and{" "}
              <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-purple-400/80">description</code> (max 1024 chars).
            </p>
            <pre className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-xs leading-relaxed text-white/60 overflow-x-auto sm:p-4 sm:text-sm">
              <code>{`---
name: solidity-developer
description: Skill for agents building smart contracts on Monad and EVM chains.
skills:
  - Solidity
  - Smart Contracts
  - Foundry
  - Hardhat
  - OpenZeppelin
  - EVM
---`}</code>
            </pre>

            <h3 className="mt-5 text-sm font-medium text-white/60 sm:mt-6 sm:text-[0.9rem]">Body (Instructions)</h3>
            <p className="mt-1.5 text-sm text-white/35 sm:text-[0.85rem]">
              Below the frontmatter, write the instructions your agent should follow.
              Include &quot;When to Use&quot; and &quot;When NOT to Use&quot; sections.
            </p>
            <pre className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-xs leading-relaxed text-white/60 overflow-x-auto sm:p-4 sm:text-sm">
              <code>{`## Instructions

You are a Solidity smart contract developer agent specializing
in EVM-compatible chains, with deep expertise in Monad.

### Core Capabilities

- **Smart contract development** — Solidity 0.8+, ERC standards,
  upgradeable proxies (UUPS, Transparent)
- **Testing & tooling** — Foundry, Hardhat, fuzz/invariant testing
- **Security** — Reentrancy, access control, OpenZeppelin, Slither
- **Gas optimization** — Storage packing, Yul, batch operations

### When to Use

Use when writing, auditing, testing, or deploying Solidity
smart contracts on Monad or other EVM chains.

### When NOT to Use

Do not use for frontend, backend APIs, or tasks unrelated
to on-chain smart contract work.`}</code>
            </pre>
          </section>

          {/* Step 3 */}
          <section id="readme-md" className="scroll-mt-16 mt-10 sm:mt-12">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-500/[0.1] text-xs font-medium text-purple-400/80 sm:h-7 sm:w-7">
                3
              </span>
              <h2 className="text-base font-medium text-white/90 sm:text-lg">
                Create README.md
              </h2>
            </div>
            <p className="mt-3 text-sm text-white/40 sm:text-[0.9rem]">
              The README.md is the human-readable description. It explains what the
              skill does and who it&apos;s ideal for.
            </p>
            <pre className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 font-mono text-xs leading-relaxed text-white/60 overflow-x-auto sm:p-4 sm:text-sm">
              <code>{`# Solidity Developer

Skill template for blockchain developers specializing in
Solidity and smart contract development on EVM-compatible chains.

## What This Skill Does

Equips your agent with deep knowledge of Solidity — from
writing and testing contracts to gas optimization and
security auditing.

## Skills Covered

- Solidity 0.8+, ERC-20/721/1155 token standards
- Foundry and Hardhat tooling
- Security patterns and static analysis
- Gas optimization techniques

## Ideal For

Builders focused on the smart contract layer on Monad
and other EVM chains.

## Installation

Copy this folder into your project's skills directory.`}</code>
            </pre>
          </section>

          {/* Tips */}
          <section id="tips" className="scroll-mt-16 mt-10 sm:mt-12">
            <div className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-xs font-medium text-white/50 sm:h-7 sm:w-7">
                ?
              </span>
              <h2 className="text-base font-medium text-white/90 sm:text-lg">Tips</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-white/40 sm:text-[0.9rem]">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                The <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-purple-400/80">description</code> field
                is the most important — it determines when the agent loads your skill.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                Keep SKILL.md under 500 lines. Move reference material to a{" "}
                <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-purple-400/80">references/</code> subfolder.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                Keep the skills tag list to 4-8 items for best discoverability.
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                Use lowercase names with hyphens only (e.g.,{" "}
                <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-purple-400/80">solidity-developer</code>).
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                Add <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-purple-400/80">scripts/</code> and{" "}
                <code className="rounded bg-white/[0.06] px-1 py-0.5 text-xs text-purple-400/80">assets/</code> subfolders
                for helper scripts and templates.
              </li>
            </ul>
          </section>

          <div className="h-8 sm:h-12" />
        </article>
      </div>

      {/* #5 Back to top button */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.08] bg-[#1a1a2e]/95 text-white/40 shadow-lg backdrop-blur-md transition-all hover:border-purple-500/20 hover:text-purple-400"
          title="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
