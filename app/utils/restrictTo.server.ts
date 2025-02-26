import type { LoaderFunctionArgs } from "react-router";
import { getFrontendUserById, getUserFromSession } from "~/data/auth.server";
import type { UserRole } from "~/models/User";

export default async function isAllowed(
  request: LoaderFunctionArgs["request"],
  role: UserRole
) {
  const userId = await getUserFromSession(request);
  const user = userId ? await getFrontendUserById(userId) : null;

  if (!user || user.role !== role) {
    return false;
  }

  return user;
}
