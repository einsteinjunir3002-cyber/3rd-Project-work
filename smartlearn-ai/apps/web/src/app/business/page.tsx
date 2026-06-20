import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import BusinessHubClient from "./BusinessHubClient";
import axios from "axios";

export default async function BusinessPortal() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch Startups and Jobs
  let initialStartups = [];
  let initialJobs = [];

  try {
    const headers = { Authorization: `Bearer ${session.user.accessToken}` };
    
    const [startupsRes, jobsRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/business/startups`, { headers }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/business/jobs`, { headers }),
    ]);

    initialStartups = startupsRes.data;
    initialJobs = jobsRes.data;
  } catch (error: any) {
    console.error("Failed to fetch business data", error.response?.data || error.message);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-teal-400">SmartLearn AI</h1>
              <span className="ml-4 px-3 py-1 bg-indigo-900/50 text-indigo-300 text-xs font-semibold rounded-full border border-indigo-800">Business & Startup Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">User: {session.user?.name}</span>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" className="text-sm font-medium text-rose-400 hover:text-rose-300">Sign Out</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <BusinessHubClient 
          initialStartups={initialStartups}
          initialJobs={initialJobs}
          accessToken={session.user.accessToken as string}
          userRoles={session.user?.roles || []}
        />
      </main>
    </div>
  );
}
