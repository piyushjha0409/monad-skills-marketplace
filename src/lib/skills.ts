import fs from "fs";
import path from "path";

export interface SkillProfile {
  slug: string;
  skillMd: string;
  readmeMd: string;
  meta: {
    name: string;
    description: string;
    skills: string[];
  };
  body: string;
}

const SKILLS_DIR = path.join(process.cwd(), "src/data/skills");

function parseFrontmatter(content: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const rawMeta = match[1];
  const body = match[2].trim();
  const meta: Record<string, unknown> = {};

  let currentKey = "";
  let inArray = false;
  const arrayValues: string[] = [];

  for (const line of rawMeta.split("\n")) {
    if (inArray) {
      if (line.startsWith("  - ")) {
        arrayValues.push(line.replace("  - ", "").trim());
        continue;
      } else {
        meta[currentKey] = [...arrayValues];
        arrayValues.length = 0;
        inArray = false;
      }
    }

    const kvMatch = line.match(/^(\w+):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      if (value === "") {
        currentKey = key;
        inArray = true;
      } else {
        meta[key] = value.replace(/^["']|["']$/g, "");
      }
    }
  }

  if (inArray) {
    meta[currentKey] = [...arrayValues];
  }

  return { meta, body };
}

export function getSkillProfiles(): SkillProfile[] {
  if (!fs.existsSync(SKILLS_DIR)) return [];

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory());

  return folders
    .map((folder) => {
      const skillPath = path.join(SKILLS_DIR, folder.name, "SKILL.md");
      const readmePath = path.join(SKILLS_DIR, folder.name, "README.md");

      if (!fs.existsSync(skillPath)) return null;

      const skillMd = fs.readFileSync(skillPath, "utf-8");
      const readmeMd = fs.existsSync(readmePath)
        ? fs.readFileSync(readmePath, "utf-8")
        : "";
      const { meta, body } = parseFrontmatter(skillMd);

      return {
        slug: folder.name,
        skillMd,
        readmeMd,
        meta: {
          name: (meta.name as string) || folder.name,
          description: (meta.description as string) || "",
          skills: (meta.skills as string[]) || [],
        },
        body,
      };
    })
    .filter(Boolean) as SkillProfile[];
}

export function getSkillProfile(slug: string): SkillProfile | null {
  const skillPath = path.join(SKILLS_DIR, slug, "SKILL.md");
  if (!fs.existsSync(skillPath)) return null;

  const readmePath = path.join(SKILLS_DIR, slug, "README.md");
  const skillMd = fs.readFileSync(skillPath, "utf-8");
  const readmeMd = fs.existsSync(readmePath)
    ? fs.readFileSync(readmePath, "utf-8")
    : "";
  const { meta, body } = parseFrontmatter(skillMd);

  return {
    slug,
    skillMd,
    readmeMd,
    meta: {
      name: (meta.name as string) || slug,
      description: (meta.description as string) || "",
      skills: (meta.skills as string[]) || [],
    },
    body,
  };
}
