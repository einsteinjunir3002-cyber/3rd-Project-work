import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";
import axios from "axios";

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch Admin Data
  let initialMetrics = { totalUsers: 0, students: 0, lecturers: 0, startups: 0, departments: 0 };
  let initialUsers = [];
  let initialStructure = [];

  try {
    const headers = { Authorization: `Bearer ${session.user.accessToken}` };
    
    const [metricsRes, usersRes, structureRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/admin/metrics`, { headers }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/admin/users`, { headers }),
      axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/admin/structure`, { headers }),
    ]);

    initialMetrics = metricsRes.data;
    initialUsers = usersRes.data;
    initialStructure = structureRes.data;
  } catch (error: any) {
    console.error("Failed to fetch admin data", error.response?.data || error.message);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-teal-400">SmartLearn AI</h1>
              <span className="ml-4 px-3 py-1 bg-teal-900/50 text-teal-300 text-xs font-semibold rounded-full border border-teal-800">System Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">System Operator: {session.user?.name}</span>
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
        <AdminDashboardClient 
          initialMetrics={initialMetrics}
          initialUsers={initialUsers}
          initialStructure={initialStructure}
          accessToken={session.user.accessToken as string}
        />
      </main>
    </div>
  );
}
