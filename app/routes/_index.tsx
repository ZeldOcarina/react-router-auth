import { redirect } from "react-router";
import type { Route } from "../+types/root";

export function loader() {
  return redirect("/app?index");
}
