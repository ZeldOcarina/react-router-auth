import { data, redirect, type LoaderFunction } from "react-router";
import { createUserSession, signup } from "~/data/auth.server";
import { getTokenFromCode } from "~/data/google.server";
import { env } from "~/env";
import User from "~/models/User";
import { authSessionStorage } from "~/sessions.server";

export const loader: LoaderFunction = async ({ request }) => {
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  console.log(code, state);

  if (!state || !code) {
    return data(
      { status: 500, data: "invalid google credentials" },
      { status: 500 }
    );
  }

  const idToken = await getTokenFromCode(code);

  const { email, given_name, family_name, sub } = idToken;

  if (!email?.endsWith("@monarchy.io")) {
    const error = encodeURIComponent("email must be a monarchy.io email");
    return redirect(`"/${state}?error=${error}`);
  }

  if (state === "sign-up") {
    // check if user already exists
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      const error = encodeURIComponent(
        "a user with this email already exists. If it's you, please log in"
      );
      return redirect(`${env.APP_ROOT_URL}/${state}?error=${error}`);
    }

    const newUser = await User.create({
      email,
      firstName: given_name,
      lastName: family_name,
      googleSub: sub,
    });

    const session = await createUserSession(newUser.id);

    return redirect("/app?index", {
      headers: {
        "Set-Cookie": await authSessionStorage.commitSession(session),
      },
    });
  }

  if (state === "sign-in") {
    const user = await User.findOne({ googleSub: sub });

    if (!user) {
      const error = encodeURIComponent(
        "a user with this google account could not be found."
      );
      return redirect(`${env.APP_ROOT_URL}/${state}?error=${error}`);
    }

    const session = await createUserSession(user.id);

    return redirect(`${env.APP_ROOT_URL}/app?index`, {
      headers: {
        "Set-Cookie": await authSessionStorage.commitSession(session),
      },
    });
  }

  return { status: 200 };
};
