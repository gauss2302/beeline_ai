import type { Route } from "next";
import { redirect } from "next/navigation";

export default function Page() {
  redirect("/projects" as Route);
}
