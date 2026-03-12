import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    num: "1",
    label: "Browse",
    desc: "Find the right skill template",
  },
  {
    num: "2",
    label: "Download",
    desc: "Get the SKILL.md + README.md folder",
  },
  {
    num: "3",
    label: "Build",
    desc: "Drop it in your project and let your agent code",
  },
];

const SOCIALS = [
  {
    href: "https://twitter.com/piyushJha__",
    title: "X / Twitter",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    href: "https://github.com/piyushjha0409",
    title: "GitHub",
    icon: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
  },
  {
    href: "https://discord.com/users/piyushjha",
    title: "Discord",
    icon: "M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z",
  },
  {
    href: "https://linkedin.com/in/piyushjha0409",
    title: "LinkedIn",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
];

export function HeroSection() {
  return (
    <section className="relative flex h-full items-center justify-center overflow-hidden overflow-y-auto">
      {/* Background image */}
      <Image
        src="/bg.png"
        alt=""
        fill
        priority
        className="object-cover object-center -z-10 pointer-events-none"
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black/60" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-5 py-10 text-center sm:px-8 sm:py-0 lg:px-12">
        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.15em] text-white/60 backdrop-blur-sm sm:mb-7 sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          Blitz Hackathon 2026
        </div>

        {/* Heading */}
        <h1 className="max-w-2xl text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl md:text-5xl lg:max-w-3xl lg:text-[3.25rem]">
          Find the right skills for your agent to{" "}
          <span className="text-purple-400">build on Monad</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-3 max-w-lg text-[0.9rem] leading-relaxed text-white/50 sm:mt-5 sm:max-w-xl sm:text-base md:text-lg">
          Download skill templates, drop them in your project, and let your
          AI coding agent build from scratch.
        </p>

        {/* CTAs — #4 secondary "How it works" link */}
        <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:gap-4">
          <Link href="/browse">
            <Button
              size="lg"
              className="h-11 rounded-lg bg-purple-600 px-7 text-sm font-medium text-white shadow-none transition-colors hover:bg-purple-500 sm:h-12 sm:px-8 sm:text-[0.9rem]"
            >
              Browse Skills
            </Button>
          </Link>
          <Link
            href="/tutorial"
            className="text-sm text-white/35 underline underline-offset-2 transition-colors hover:text-white/60 sm:text-[0.9rem]"
          >
            How it works
          </Link>
        </div>

        {/* #4 "How it works" — 3-step visual */}
        <div className="mt-10 grid w-full max-w-xl grid-cols-3 gap-3 sm:mt-12 sm:gap-4">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex flex-col items-center text-center">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/[0.1] text-sm font-medium text-purple-400/90 sm:h-10 sm:w-10">
                {step.num}
                {i < STEPS.length - 1 && (
                  <div className="absolute left-full top-1/2 hidden h-px w-3 bg-white/[0.08] sm:block sm:w-4" />
                )}
              </div>
              <p className="mt-2 text-xs font-medium text-white/70 sm:mt-2.5 sm:text-sm">
                {step.label}
              </p>
              <p className="mt-0.5 hidden text-[11px] leading-snug text-white/30 sm:block sm:text-xs">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-auto mt-8 h-px w-16 bg-white/[0.08] sm:mt-10" />

        {/* Creator */}
        <div className="mt-5 flex flex-col items-center gap-2.5 sm:mt-7 sm:gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-white/[0.1] sm:h-14 sm:w-14">
            <Image
              src="/badge.jpg"
              alt="Piyush Jha"
              fill
              className="object-cover object-top"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/90">Piyush Jha</p>
            <p className="mt-0.5 text-xs text-white/40">Developer Evangelist, Monad</p>
          </div>
          <div className="flex items-center gap-1.5">
            {SOCIALS.map(({ href, title, icon }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/60"
                title={title}
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d={icon} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
