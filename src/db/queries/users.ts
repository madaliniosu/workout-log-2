import { db } from "@/db/client";
import { users } from "@/db/schema";

// Pre-auth bootstrap: there's exactly one implicit "local user" until real
// auth exists. Lazily created on first write, then always the same row —
// this is the only place that fact is known; everything else just calls
// getCurrentUserId().
export async function getOrCreateDefaultUser() {
  const [existing] = await db.select().from(users).limit(1);
  if (existing) return existing;

  const [created] = await db.insert(users).values({}).returning();
  return created;
}
