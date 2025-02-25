import { createContext, useContext, useState } from "react";
import type { FrontendUserSchema } from "~/models/User";

interface UserContextI {
  user: FrontendUserSchema | null;
}

const UserContext = createContext<UserContextI>({
  user: null,
});

function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: FrontendUserSchema | null;
}) {
  return (
    <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
  );
}

function useUser() {
  const context = useContext(UserContext);
  if (context === undefined)
    throw new Error("UserContext has been used outside of the SpinnerProvider");
  return context;
}

export { UserProvider, useUser };
