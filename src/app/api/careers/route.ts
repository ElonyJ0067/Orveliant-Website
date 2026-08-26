import { NextResponse } from "next/server";
import { getCareerRole, isValidRoleId, careerPath } from "@/lib/careers";
import { formatCareersAlert, sendTelegramAlert } from "@/lib/telegram";

type Payload = {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  commitment?: string;
  location?: string;
  links?: string;
  experience?: string;
  message?: string;
};

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name ?? "").trim().slice(0, 120);
  const email = (body.email ?? "").trim().slice(0, 200);
  const phone = (body.phone ?? "").trim().slice(0, 80);
  const roleId = (body.roleId ?? "").trim().slice(0, 80);
  const commitmentRaw = (body.commitment ?? "").trim();
  const commitment =
    commitmentRaw === "Part-time" || commitmentRaw === "Full-time"
      ? commitmentRaw
      : "Full-time";
  const location = (body.location ?? "").trim().slice(0, 120);
  const links = (body.links ?? "").trim().slice(0, 500);
  const experience = (body.experience ?? "").trim().slice(0, 160);
  const message = (body.message ?? "").trim().slice(0, 4000);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const linksOk = links.length >= 8 && (/https?:\/\//i.test(links) || links.includes("."));
  if (
    !name ||
    !emailValid ||
    !isValidRoleId(roleId) ||
    !location ||
    !linksOk ||
    message.length < 80
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please provide your name, email, location, a work link, and a brief note.",
      },
      { status: 422 },
    );
  }

  const role = getCareerRole(roleId)!;

  console.log("[careers] application received", {
    name,
    email,
    phone,
    roleId,
    roleTitle: role.title,
    team: role.team,
    commitment,
    location,
    experience,
    at: new Date().toISOString(),
  });

  await sendTelegramAlert(
    formatCareersAlert({
      name,
      email,
      phone,
      roleTitle: role.title,
      team: role.team,
      path: careerPath(roleId),
      commitment,
      compensation: role.compensation,
      compensationNote: role.compensationNote,
      location,
      experience,
      links,
      message,
    }),
  );

  return NextResponse.json({ ok: true });
}
