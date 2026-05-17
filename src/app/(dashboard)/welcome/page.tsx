import { redirect } from "next/navigation";

/** Legacy path — member home (profile + wallet + hub) lives at `/member`. */
export default function WelcomePage() {
  redirect("/member");
}
