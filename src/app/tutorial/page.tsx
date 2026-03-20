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
  const [active, setActive] = useState("structure");

  useEffect(() => {
    const el = document.getElementById("tutorial-scroll");
    if (!el) return;

    function onScroll() {
      setShowTop(el!.scrollTop > 300);
      for (const s of [...SECTIONS].reverse()) {
        const target = document.getElementById(s.id);
        if (target && target.getBoundingClientRect().top <= 120) {
          setActive(s.id);
          break;
        }
      }
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div id="tutorial-scroll" className="h-full overflow-auto bg-white">
      {/* Animated grid */}
      <div className="pointer-events-none fixed inset-0">
        <div className="bg-grid bg-grid-fade absolute inset-0" />
        <div className="bg-grid-dots bg-grid-fade absolute inset-0" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-20 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center px-5 py-3 sm:px-8 lg:max-w-3xl">
          <Link
            href="/browse"
            className="mr-4 text-gray-400 transition-colors hover:text-purple-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="h-4 w-px bg-gray-100" />
          <div className="flex gap-1 overflow-x-auto pl-3">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all sm:text-xs ${
                  active === s.id
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-400 hover:bg-purple-50 hover:text-purple-600"
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <div className="relative px-5 py-10 sm:px-8 sm:py-16">
        <article className="mx-auto max-w-2xl lg:max-w-3xl">
          <h1 className="text-xl font-bold tracking-[-0.02em] text-gray-900 sm:text-2xl md:text-[1.75rem]">
            How to create a skill folder
          </h1>

          <p className="mt-4 text-sm leading-[1.7] text-gray-500 sm:text-base">
            Each skill is a <strong className="text-gray-800">folder</strong> with{" "}
            <Code>SKILL.md</Code> and <Code>README.md</Code>.
            Compatible with Claude Code, Codex, and other agent platforms.
          </p>

          <div className="mt-10 h-px bg-gray-100 sm:mt-12" />

          {/* Step 1 */}
          <section id="structure" className="scroll-mt-16 mt-10 sm:mt-12">
            <StepHeader num={1} title="Folder structure" />
            <p className="mt-4 text-sm text-gray-500 sm:text-[0.9rem]">
              Create a folder for your skill inside your project&apos;s skills directory.
            </p>
            <CodeBlock>{`your-project/
└── skills/
    └── solidity-developer/
        ├── SKILL.md      # Required — metadata + agent instructions
        └── README.md     # Human-readable description`}</CodeBlock>
          </section>

          {/* Step 2 */}
          <section id="skill-md" className="scroll-mt-16 mt-12 sm:mt-14">
            <StepHeader num={2} title="Create SKILL.md" />
            <p className="mt-4 text-sm text-gray-500 sm:text-[0.9rem]">
              Two parts: YAML frontmatter (metadata) and a markdown body (agent instructions).
            </p>

            <h3 className="mt-6 text-sm font-semibold text-gray-700 sm:text-[0.9rem]">Frontmatter</h3>
            <p className="mt-1.5 text-sm text-gray-400">
              <Code>name</Code> (lowercase, hyphens) and <Code>description</Code> (max 1024 chars) are required.
            </p>
            <CodeBlock>{`---
name: solidity-developer
description: Skill for agents building smart contracts on Monad and EVM chains.
skills:
  - Solidity
  - Smart Contracts
  - Foundry
  - Hardhat
  - OpenZeppelin
  - EVM
---`}</CodeBlock>

            <h3 className="mt-6 text-sm font-semibold text-gray-700 sm:text-[0.9rem]">Body</h3>
            <p className="mt-1.5 text-sm text-gray-400">
              Instructions the agent should follow. Include when to use and when not to.
            </p>
            <CodeBlock>{`## Instructions

You are a Solidity smart contract developer agent specializing
in EVM-compatible chains, with deep expertise in Monad.

### Core Capabilities

- **Smart contract development** — Solidity 0.8+, ERC standards
- **Testing & tooling** — Foundry, Hardhat, fuzz/invariant testing
- **Security** — Reentrancy, access control, OpenZeppelin, Slither
- **Gas optimization** — Storage packing, Yul, batch operations

### When to Use

Writing, auditing, testing, or deploying Solidity contracts.

### When NOT to Use

Frontend, backend APIs, or non-contract work.`}</CodeBlock>
          </section>

          {/* Step 3 */}
          <section id="readme-md" className="scroll-mt-16 mt-12 sm:mt-14">
            <StepHeader num={3} title="Create README.md" />
            <p className="mt-4 text-sm text-gray-500 sm:text-[0.9rem]">
              Human-readable description of the skill.
            </p>
            <CodeBlock>{`# Solidity Developer

Skill template for smart contract development on EVM chains.

## What This Skill Does

Equips your agent with Solidity expertise — writing,
testing, gas optimization, and security auditing.

## Skills Covered

- Solidity 0.8+, ERC-20/721/1155 token standards
- Foundry and Hardhat tooling
- Security patterns and static analysis

## Ideal For

Builders focused on the smart contract layer on Monad.

## Installation

Copy this folder into your project's skills directory.`}</CodeBlock>
          </section>

          {/* Tips */}
          <section id="tips" className="scroll-mt-16 mt-12 sm:mt-14">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                ?
              </span>
              <h2 className="text-[0.9rem] font-semibold text-gray-800 sm:text-base">Tips</h2>
            </div>
            <ul className="mt-5 space-y-3.5 text-sm text-gray-500 sm:text-[0.9rem]">
              {[
                <>The <Code>description</Code> field determines when the agent loads your skill — make it specific.</>,
                <>Keep SKILL.md under 500 lines. Heavy docs go in <Code>references/</Code>.</>,
                <>4-8 skill tags for best discoverability.</>,
                <>Lowercase names with hyphens: <Code>solidity-developer</Code>.</>,
                <>Optional <Code>scripts/</Code> and <Code>assets/</Code> subfolders for helpers.</>,
              ].map((text, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-purple-300" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="h-12 sm:h-16" />
        </article>
      </div>

      {/* Back to top */}
      {showTop && (
        <button
          onClick={() => document.getElementById("tutorial-scroll")?.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-lg transition-all hover:text-purple-500"
        >
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function StepHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
        {num}
      </span>
      <h2 className="text-[0.9rem] font-semibold text-gray-800 sm:text-base">{title}</h2>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 font-mono text-xs leading-[1.7] text-gray-600 overflow-x-auto sm:p-5 sm:text-sm">
      <code>{children}</code>
    </pre>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-purple-50 px-1.5 py-0.5 text-xs font-semibold text-purple-600">
      {children}
    </code>
  );
}
