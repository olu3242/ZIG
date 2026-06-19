import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requirePlatformOwner() {
  const cookieStore = await cookies();
  const session = cookieStore.get("zig_session")?.value;
  const persona = cookieStore.get("zig_persona")?.value;
  if (!hasValidSessionCookie(session)) {
    redirect("/");
  }
  if (persona !== "Platform Owner") {
    redirect("/");
  }
}

function hasValidSessionCookie(raw: string | undefined): boolean {
  if (!raw) {
    return false;
  }

  try {
    const session = JSON.parse(raw) as { accessToken?: string; userId?: string; email?: string };
    return Boolean(session.accessToken && session.userId && session.email);
  } catch {
    return false;
  }
}
