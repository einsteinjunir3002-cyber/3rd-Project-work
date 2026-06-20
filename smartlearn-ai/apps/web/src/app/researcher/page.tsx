import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ResearcherDashboardClient from "./ResearcherDashboardClient";

async function getResearchProjects(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/research/projects`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch research projects:", error);
    return [];
  }
}

export default async function ResearcherDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch the research projects assigned to this PI
  const projects = await getResearchProjects(session.user.accessToken);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-extrabold text-violet-600 tracking-tight">SmartLearn AI</h1>
              <span className="ml-4 px-3 py-1 bg-violet-100 text-violet-800 text-xs font-semibold rounded-full border border-violet-200">
                Researcher Portal
              </span>
              {session.user.roles?.includes("LECTURER") && (
                <Link href="/lecturer" className="ml-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200 transition">
                  Lecturer Portal &rarr;
                </Link>
              )}
              {session.user.roles?.includes("ETHICS_COMMITTEE_MEMBER") && (
                <Link href="/ethics" className="ml-2 text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full border border-purple-200 transition">
                  Ethics Committee &rarr;
                </Link>
              )}
              {session.user.roles?.includes("CAREER_ADVISOR") && (
                <Link href="/advisor" className="ml-2 text-xs font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-full border border-sky-200 transition">
                  Advisor Portal &rarr;
                </Link>
              )}
              {session.user.roles?.includes("ALUMNI") && (
                <Link href="/alumni" className="ml-2 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 transition">
                  Alumni Portal &rarr;
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-500 font-medium">Welcome, {session.user?.name}</span>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" className="text-sm font-semibold text-red-600 hover:text-red-500 transition">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Research & Ethics Portal</h2>
            <p className="text-sm text-gray-500 mt-1">Manage active grants, tasks, ethics reviews, and log publication outputs.</p>
          </div>
        </div>

        <ResearcherDashboardClient initialProjects={projects} token={session.user.accessToken} />
      </main>
    </div>
  );
}
