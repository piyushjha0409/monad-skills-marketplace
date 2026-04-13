import fs from "fs";
import path from "path";
import { parseFrontmatter } from "./parse-frontmatter";

export interface TemplateProfile {
  slug: string;
  skillMd: string;
  meta: {
    name: string;
    description: string;
    category: string;
    difficulty: string;
    skills: string[];
  };
  files: string[];
  body: string;
}

const TEMPLATES_DIR = path.join(process.cwd(), "src/data/templates");

function inferTemplateMeta(slug: string, meta: Record<string, unknown>, body: string) {
  const skills = Array.isArray(meta.skills) ? (meta.skills as string[]) : [];
  const category = (meta.category as string) || "App Template";
  const difficulty = (meta.difficulty as string) || "intermediate";

  return {
    name: (meta.name as string) || slug,
    description: (meta.description as string) || "",
    category,
    difficulty,
    skills: skills.length > 0 ? skills : inferSkillsFromBody(body),
  };
}

function inferSkillsFromBody(body: string): string[] {
  const hints = ["Monad", "Pyth", "Hardhat", "Wagmi", "ConnectKit", "VRF", "Solidity"];
  return hints.filter((h) => body.toLowerCase().includes(h.toLowerCase()));
}

function inferFilesFromBody(body: string): string[] {
  const matches = Array.from(body.matchAll(/`([^`]+)`/g)).map((m) => m[1]);
  const normalized = matches.filter((m) => m.includes("/") || m.includes("."));
  const unique = Array.from(new Set(["SKILL.md", ...normalized]));
  return unique.slice(0, 8);
}

export function getTemplateProfiles(): TemplateProfile[] {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];

  const entries = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory());

  return folders
    .map((folder) => {
      const skillPath = path.join(TEMPLATES_DIR, folder.name, "SKILL.md");
      if (!fs.existsSync(skillPath)) return null;

      const skillMd = fs.readFileSync(skillPath, "utf-8");
      const { meta, body } = parseFrontmatter(skillMd);
      const inferred = inferTemplateMeta(folder.name, meta, body);

      return {
        slug: folder.name,
        skillMd,
        body,
        files: inferFilesFromBody(body),
        meta: inferred,
      } satisfies TemplateProfile;
    })
    .filter(Boolean) as TemplateProfile[];
}

export function getTemplateProfile(slug: string): TemplateProfile | null {
  const skillPath = path.join(TEMPLATES_DIR, slug, "SKILL.md");
  if (!fs.existsSync(skillPath)) return null;

  const skillMd = fs.readFileSync(skillPath, "utf-8");
  const { meta, body } = parseFrontmatter(skillMd);

  return {
    slug,
    skillMd,
    body,
    files: inferFilesFromBody(body),
    meta: inferTemplateMeta(slug, meta, body),
  };
}
