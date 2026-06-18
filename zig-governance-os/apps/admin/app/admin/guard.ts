import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requirePlatformOwner() {
  const persona = (await cookies()).get("zig_persona")?.value;
  if (persona !== "Platform Owner") {
    redirect("/");
  }
}
