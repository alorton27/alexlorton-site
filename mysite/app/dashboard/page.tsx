import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return (
      <div className="p-6">
        <p>You must be signed in.</p>
        <Link className="underline" href="/login">Go to login</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl">Welcome, {session.user?.email}</h1>
      <ul className="list-disc ml-6">
        <li>Spanish practice (coming soon)</li>
        <li>Family dinners log (coming soon)</li>
        <li>Age-graded race time predictor (coming soon)</li>
      </ul>
    </div>
  );
}
