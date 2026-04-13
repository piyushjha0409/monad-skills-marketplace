import { NextResponse } from "next/server";
import { getTemplateProfiles } from "@/lib/templates";

export async function GET() {
  const templates = getTemplateProfiles();
  return NextResponse.json(templates);
}
