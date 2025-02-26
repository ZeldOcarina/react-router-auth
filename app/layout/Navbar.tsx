import clsx from "clsx";
import { Form } from "react-router";
import { AppLogo } from "~/components/AppLogo";
import { Button } from "~/components/ui/button";
import { useUser } from "~/context/UserContext";

export default function Navbar() {
  const user = useUser();

  return (
    <nav
      className={clsx(
        "px-8 py-8 flex items-center",
        user ? "justify-between" : "justify-center"
      )}
    >
      <AppLogo />
      <Form method="POST" action="/sign-out">
        <Button type="submit">Log Out</Button>
      </Form>
    </nav>
  );
}
