import clsx from "clsx";
import logo from "~/assets/monarchy-logo.png";
import smallLogo from "~/assets/logo-small.png";

export function AppLogo({ className }: { className?: string }) {
  return (
    <img src={logo} alt="Monarchy logo" className={clsx("w-80", className)} />
  );
}

export function SmallAppLogo({ className }: { className?: string }) {
  return (
    <img
      src={smallLogo}
      alt="Monarchy logo"
      className={clsx(className ? className : "w-14")}
    />
  );
}
