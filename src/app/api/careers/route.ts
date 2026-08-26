import { NextResponse } from "next/server";
import { getCareerRole, isValidRoleId, careerPath, validateApplicationLinks, applicationLinkCopy } from "@/lib/careers";
import {
  formatCareersAlert,
  sendTelegramAlert,
  sendTelegramDocument,
} from "@/lib/telegram";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const roleId = String(formData.get("roleId") ?? "").trim().slice(0, 80);
  const commitmentRaw = String(formData.get("commitment") ?? "").trim();
  const commitment =
    commitmentRaw === "Part-time" || commitmentRaw === "Full-time"
      ? commitmentRaw
      : "Full-time";
  const location = String(formData.get("location") ?? "").trim().slice(0, 120);
  const linkedin = String(formData.get("linkedin") ?? "").trim().slice(0, 500);
  const githubOrPortfolio = String(formData.get("githubOrPortfolio") ?? "")
    .trim()
    .slice(0, 500);
  const experience = String(formData.get("experience") ?? "").trim().slice(0, 160);
  const message = String(formData.get("message") ?? "").trim().slice(0, 4000);
  const resumeEntry = formData.get("resume");
  const resume =
    resumeEntry instanceof File && resumeEntry.size > 0 ? resumeEntry : null;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!name || !emailValid || !isValidRoleId(roleId) || !location || message.length < 80) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please provide your name, email, location, and a brief note.",
      },
      { status: 422 },
    );
  }

  const role = getCareerRole(roleId)!;
  const links = validateApplicationLinks(role, linkedin, githubOrPortfolio);
  if (!links.ok) {
    return NextResponse.json({ ok: false, error: links.error }, { status: 422 });
  }

  if (resume) {
    if (resume.size > MAX_RESUME_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Resume must be 5 MB or smaller." },
        { status: 422 },
      );
    }
    if (!RESUME_TYPES.has(resume.type)) {
      return NextResponse.json(
        { ok: false, error: "Resume must be a PDF or Word document." },
        { status: 422 },
      );
    }
  }

  console.log("[careers] application received", {
    name,
    email,
    roleId,
    roleTitle: role.title,
    team: role.team,
    commitment,
    location,
    experience,
    resume: resume?.name ?? null,
    at: new Date().toISOString(),
  });

  const alert = formatCareersAlert({
    name,
    email,
    roleTitle: role.title,
    team: role.team,
    path: careerPath(roleId),
    commitment,
    compensation: role.compensation,
    compensationNote: role.compensationNote,
    location,
    experience,
    linkedin,
    githubOrPortfolio,
    secondLinkLabel: applicationLinkCopy(role).secondLinkLabel,
    resumeName: resume?.name,
    message,
  });

  await sendTelegramAlert(alert);

  if (resume) {
    const caption = `Resume — ${name} · ${role.title}`;
    await sendTelegramDocument(resume, resume.name, caption);
  }

  return NextResponse.json({ ok: true });
}
