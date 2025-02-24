// app/utils/theme.server.ts
import { createCookieSessionStorage } from "react-router";
import { createThemeSessionResolver } from "remix-themes";

export const themeSessionResolver = createThemeSessionResolver(
  createCookieSessionStorage({
    cookie: {
      name: "__theme",
      secure: process.env.NODE_ENV === "production",
      secrets: ["your-secret"],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
    },
  })
);
