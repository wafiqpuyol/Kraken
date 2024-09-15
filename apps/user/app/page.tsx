import { getServerSession } from "next-auth"
import { authOptions } from "@repo/network"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session?.user?.uid) {
    redirect("/dashboard/transfer/deposit")
  }
  return (
    <h1>home</h1>
  );
}
