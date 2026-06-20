import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getMyCourses(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/enrollments/my-courses`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function StudentDashboard() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  // Fetch real enrollments from the backend
  const enrollments = await getMyCourses(session.user.accessToken);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-blue-600">SmartLearn AI</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Student Portal</span>
              <Link href="/student/mentorship" className="ml-4 text-xs font-semibold text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-3 py-1 rounded-full border border-violet-200 transition">
                Mentorship Center &rarr;
              </Link>
              {session.user.roles?.includes("ALUMNI") && (
                <Link href="/alumni" className="ml-2 text-xs font-semibold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200 transition">
                  Alumni Portal &rarr;
                </Link>
              )}
              {session.user.roles?.includes("CAREER_ADVISOR") && (
                <Link href="/advisor" className="ml-2 text-xs font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-full border border-sky-200 transition">
                  Advisor Portal &rarr;
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
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Your Dashboard</h2>
          <Link href="/courses" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Browse Course Catalog
          </Link>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Enrolled Courses</h3>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{enrollments.length}</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4">My Courses</h3>
        {enrollments.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
            <p className="text-gray-500 mb-4">You are not enrolled in any courses yet.</p>
            <Link href="/courses" className="text-blue-600 font-medium hover:underline">Find courses to enroll in</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-2">{enrollment.course.code}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{enrollment.course.title}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{enrollment.course.description || "No description provided."}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">{enrollment.course.credits} Credits</span>
                  <Link href={`/student/courses/${enrollment.courseId}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    View Materials &rarr;
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
