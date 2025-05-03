import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to the create account page
  redirect("/auth/create-account")
}
