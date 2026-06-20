import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import StudentMentorshipClient from "./StudentMentorshipClient";

async function getMentors(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/career/mentors`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch mentors list:", error);
    return [];
  }
}

async function getMyRequests(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/career/mentorship-requests/student`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch student requests:", error);
    return [];
  }
}

export default async function StudentMentorshipPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Ensure student/admin role
  const hasAccess = session.user.roles?.some(role => ["STUDENT", "SYSTEM_ADMINISTRATOR"].includes(role));
  
  if (!hasAccess) {
    redirect("/login");
  }

  const [mentors, myRequests] = await Promise.all([
    getMentors(session.user.accessToken),
    getMyRequests(session.user.accessToken)
  ]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-violet-400 tracking-tight">SmartLearn AI</h1>
              <span className="ml-4 px-3 py-1 bg-violet-900/50 text-violet-300 text-xs font-semibold rounded-full border border-violet-800">
                Mentorship Center
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/student" className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600 transition">
                &larr; Back to Dashboard
              </Link>
              
              <span className="text-sm text-gray-400 font-medium">Student: {session.user?.name}</span>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" id="btn-student-ment-signout" className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Alumni & Advisor Matchmaking</h2>
          <p className="text-sm text-gray-400 mt-1">Connect with industry alumni and career advisors. Filter by skills, check backgrounds, and submit advice request tickets.</p>
        </div>

        <StudentMentorshipClient initialMentors={mentors} initialRequests={myRequests} token={session.user.accessToken} />
      </main>
    </div>
  );
}
