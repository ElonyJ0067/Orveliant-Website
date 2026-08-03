import { NextResponse } from "next/server";
import { getCareerRole, isValidRoleId } from "@/lib/careers";
import { formatCareersAlert, sendTelegramAlert } from "@/lib/telegram";

type Payload = {
  name?: string;
  email?: string;
  roleId?: string;
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
  const roleId = (body.roleId ?? "").trim().slice(0, 80);
  const location = (body.location ?? "").trim().slice(0, 120);
  const links = (body.links ?? "").trim().slice(0, 500);
  const experience = (body.experience ?? "").trim().slice(0, 160);
  const message = (body.message ?? "").trim().slice(0, 4000);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailValid || !isValidRoleId(roleId) || message.length < 20) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please provide your name, a valid email, a role, and a brief note.",
      },
      { status: 422 },
    );
  }

  const role = getCareerRole(roleId)!;

  console.log("[careers] application received", {
    name,
    email,
    roleId,
    roleTitle: role.title,
    location,
    experience,
    open: role.open,
    at: new Date().toISOString(),
  });

  await sendTelegramAlert(
    formatCareersAlert({
      name,
      email,
      roleTitle: role.title,
      roleOpen: role.open,
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
