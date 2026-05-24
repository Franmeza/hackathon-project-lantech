import { auth } from "@/auth";
import type { Session } from "next-auth";

export async function requireSession(): Promise<Session | null> {
  const session = (await auth()) as unknown as Session | null;
  if (!session?.user?.id) return null;
  return session;
}

