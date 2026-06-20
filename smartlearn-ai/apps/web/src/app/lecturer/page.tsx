import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getLecturerCourses(token: string, lecturerId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const allCourses = await res.json();
    // Filter to only show courses this lecturer teaches
    return allCourses.filter((course: any) => course.instructorId === lecturerId);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function LecturerDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const courses = await getLecturerCourses(session.user.accessToken, session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">SmartLearn AI</h1>
              <span className="ml-4 px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">Lecturer Portal</span>
              {session.user.roles?.includes("RESEARCHER") && (
                <Link href="/researcher" className="ml-4 text-xs font-semibold text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3 py-1 rounded-full border border-violet-200 transition">
                  Researcher Portal &rarr;
                </Link>
              )}
              {session.user.roles?.includes("ETHICS_COMMITTEE_MEMBER") && (
                <Link href="/ethics" className="ml-2 text-xs font-semibold text-purple-650 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-full border border-purple-200 transition">
                  Ethics Committee &rarr;
                </Link>
              )}
              {session.user.roles?.includes("CAREER_ADVISOR") && (
                <Link href="/advisor" className="ml-2 text-xs font-semibold text-sky-650 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-full border border-sky-200 transition">
                  Advisor Portal &rarr;
                </Link>
              )}
              {session.user.roles?.includes("ALUMNI") && (
                <Link href="/alumni" className="ml-2 text-xs font-semibold text-emerald-650 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 transition">
                  Alumni Portal &rarr;
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {session.user?.name}</span>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-500">Sign Out</button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Faculty Dashboard</h2>
          <Link href="/lecturer/courses/create" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
            + Create New Course
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Active Courses</h3>
              <p className="mt-1 text-3xl font-semibold text-indigo-600">{courses.length}</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4">My Teaching Schedule</h3>
        {courses.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
            <p className="text-gray-500">You have not created any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-2">{course.code}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description || "No description provided."}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{course.credits} Credits</span>
                  <Link href={`/lecturer/courses/${course.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                    Manage Course &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
