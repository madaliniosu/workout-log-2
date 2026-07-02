import { getOrCreateDefaultUser } from "@/db/queries/users";

// Swap point for future auth: replace this body with a session lookup.
// Every caller just wants "the current user's id" and shouldn't know or
// care that it's a bootstrapped placeholder today.
export async function getCurrentUserId() {
  const user = await getOrCreateDefaultUser();
  return user.id;
}
