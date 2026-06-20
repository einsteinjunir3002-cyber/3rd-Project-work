import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AlumniDashboardClient from "./AlumniDashboardClient";

async function getMentorshipRequests(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/career/mentorship-requests/mentor`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch mentorship requests:", error);
    return [];
  }
}

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

export default async function AlumniPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Ensure authorized roles
  const allowedRoles = ["ALUMNI", "SYSTEM_ADMINISTRATOR"];
  const hasAccess = session.user.roles?.some(role => allowedRoles.includes(role));
  
  if (!hasAccess) {
    redirect("/student");
  }

  const [requests, mentors] = await Promise.all([
    getMentorshipRequests(session.user.accessToken),
    getMentors(session.user.accessToken)
  ]);

  // Find current user's profile details
  const myProfile = mentors.find((m: any) => m.id === session.user.id) || {
    id: session.user.id,
    email: session.user.email,
    firstName: session.user.name?.split(" ")[0] || "",
    lastName: session.user.name?.split(" ")[1] || "",
    roles: session.user.roles,
    graduationYear: null,
    company: "",
    jobTitle: "",
    bio: "",
    skills: [],
    advisorExpertise: null
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <nav className="bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-emerald-400 tracking-tight">SmartLearn AI</h1>
              <span className="ml-4 px-3 py-1 bg-emerald-900/50 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-800">
                Alumni Console
              </span>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-2">
                {session.user.roles?.includes("SYSTEM_ADMINISTRATOR") && (
                  <Link href="/admin" className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600 transition">
                    Admin Portal
                  </Link>
                )}
                {session.user.roles?.includes("STUDENT") && (
                  <Link href="/student" className="text-xs font-semibold text-gray-300 hover:text-white bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-600 transition">
                    Student Portal
                  </Link>
                )}
              </div>

              <span className="text-sm text-gray-400 font-medium">Welcome, {session.user?.name}</span>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" id="btn-alumni-signout" className="text-sm font-semibold text-rose-400 hover:text-rose-300 transition">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">Alumni Mentorship Dashboard</h2>
          <p className="text-sm text-gray-400 mt-1">Configure your mentor profile, outline your skills, and manage student matching tickets.</p>
        </div>

        <AlumniDashboardClient initialProfile={myProfile} initialRequests={requests} token={session.user.accessToken} />
      </main>
    </div>
  );
}
