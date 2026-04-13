import { getTemplateProfile, getTemplateProfiles } from "@/lib/templates";
import { notFound } from "next/navigation";
import { TemplateDetailContent } from "@/components/templates/template-detail-content";

export async function generateStaticParams() {
  const profiles = getTemplateProfiles();
  return profiles.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getTemplateProfile(slug);
  if (!profile) return {};
  return {
    title: `${profile.meta.name} | SkillForge`,
    description: profile.meta.description,
  };
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = getTemplateProfile(slug);
  if (!profile) notFound();
  return <TemplateDetailContent profile={profile} />;
}
