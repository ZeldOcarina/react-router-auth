import clsx from "clsx";
import { AppLogo } from "~/components/AppLogo";

export default function Navbar() {
  return (
    <nav
      className={clsx(
        "px-8 py-8 flex items-center"
        // userId && authorized ? "justify-between" : "justify-center"
      )}
    >
      <AppLogo />
    </nav>
  );
}
