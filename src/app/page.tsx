import { redirect } from "next/navigation";

// The app's three sections live at /log, /plan, /analyze 
export default function HomePage() {
  redirect("/log");
}
