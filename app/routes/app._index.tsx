import { H1 } from "~/components/ui/typography";
import type { Route } from "../+types/root";

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <main className="grow h-full flex justify-center pt-8">
      <H1>Welcome to the Monarchy Connector</H1>
    </main>
  );
}
