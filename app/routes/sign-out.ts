import { data, redirect, type ActionFunction } from "react-router";
import { destroyUserSession } from "~/data/auth.server";

export const action: ActionFunction = async ({ request }) => {
  switch (request.method) {
    case "POST":
      const newCookie = await destroyUserSession(request);
      return redirect("/sign-in", {
        headers: { "Set-Cookie": newCookie },
      });
    default:
      throw data({ status: 405, data: "method not allowed" }, { status: 405 });
  }
};
