import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import EthicsDashboardClient from "./EthicsDashboardClient";

async function getPendingApplications(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/research/ethics/pending`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch pending ethics applications:", error);
    return [];
  }
}

export default async function EthicsPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Ensure authorized roles
  const allowedRoles = ["ETHICS_COMMITTEE_MEMBER", "SUPERVISOR", "SYSTEM_ADMINISTRATOR"];
  const hasAccess = session.user.roles?.some(role => allowedRoles.includes(role));
  
  if (!hasAccess) {
    redirect("/student");
  }

  const applications = await getPendingApplications(session.user.accessToken);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-violet-400 tracking-tight">SmartLearn AI</h1>
              <span className="ml-4 px-3 py-1 bg-violet-900/50 text-violet-300 text-xs font-semibold rounded-full border border-violet-800">
                Ethics Committee
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-2">
                {session.user.roles?.includes("SYSTEM_ADMINISTRATOR") && (
                  <Link href="/admin" className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600 transition">
                    Admin Portal
                  </Link>
                )}
                {session.user.roles?.includes("RESEARCHER") && (
                  <Link href="/researcher" className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600 transition">
                    Researcher Portal
                  </Link>
                )}
              </div>

              <span className="text-sm text-gray-400 font-medium">Reviewer: {session.user?.name}</span>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" id="btn-sign-out" className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Research Ethics Applications</h2>
            <p className="text-sm text-gray-400 mt-1">Review pending protocol submissions and grant ethical approvals.</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-xl shadow-inner text-sm text-gray-300 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse"></span>
            <span>{applications.length} Applications Awaiting Review</span>
          </div>
        </div>

        <EthicsDashboardClient initialApps={applications} token={session.user.accessToken} />
      </main>
    </div>
  );
}
