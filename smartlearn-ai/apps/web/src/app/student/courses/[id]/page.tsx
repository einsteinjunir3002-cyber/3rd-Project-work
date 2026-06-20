import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getCourseDetails(id: string, token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function CourseDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const course = await getCourseDetails(params.id, session.user.accessToken);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-850 mb-2">Course Not Found</h2>
        <p className="text-gray-500 mb-6">The course you are looking for does not exist or has been removed.</p>
        <Link href="/student" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/student" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition">
                SmartLearn AI
              </Link>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                Student Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {session.user?.name}</span>
              <form action={async () => {
                "use server";
                await signOut();
              }}>
                <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-500 transition">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/student" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <span>&larr;</span> <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Course Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <div className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">
                {course.code} &bull; {course.program?.name || "Program"}
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{course.title}</h2>
            </div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100 self-start sm:self-auto">
              {course.credits} Credits
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main info columns (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Course Description</h3>
              <p className="text-gray-650 leading-relaxed text-sm">
                {course.description || "No detailed description provided for this course."}
              </p>
            </section>

            {/* Course Materials / PDFs */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Course Materials</h3>
              {!course.materials || course.materials.length === 0 ? (
                <p className="text-sm text-gray-500">No materials uploaded for this course yet.</p>
              ) : (
                <div className="space-y-4">
                  {course.materials.map((material: any) => (
                    <div key={material.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-100 transition gap-4">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{material.title}</h4>
                          <p className="text-xs text-gray-500">Academic Resource Document (PDF)</p>
                        </div>
                      </div>
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-lg text-center transition flex items-center justify-center space-x-1"
                      >
                        <span>Open Document PDF</span>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Assignments */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Course Assignments</h3>
              {!course.assignments || course.assignments.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">There are no assignments configured for this course yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {course.assignments.map((assignment: any) => (
                    <div key={assignment.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-gray-950">{assignment.title}</h4>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-50 text-yellow-800 border border-yellow-100 rounded-full">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{assignment.description || "No description provided."}</p>
                      <div className="text-xs text-gray-500 font-medium">Max Points: {assignment.totalPoints}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Columns (Right 1 column) */}
          <div className="space-y-6">
            {/* Instructor Card */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Instructor Profile</h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-base border border-blue-100">
                  {course.instructor?.firstName?.[0]}{course.instructor?.lastName?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{course.instructor?.firstName} {course.instructor?.lastName}</h4>
                  <p className="text-xs text-gray-500">Academic Professor</p>
                </div>
              </div>
              <div className="space-y-2.5 pt-4 border-t border-gray-150 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact Email:</span>
                  <span className="font-medium text-gray-900">{course.instructor?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Academic Faculty:</span>
                  <span className="font-medium text-gray-900">{course.program?.department?.faculty?.name || "Computing"}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 shadow-sm">
              <h4 className="font-bold text-blue-900 text-sm mb-2">Student Status</h4>
              <p className="text-xs text-blue-700 leading-relaxed mb-4">
                You are currently actively enrolled in this course. You can access all class files, syllabus documents, and grades.
              </p>
              <div className="px-3 py-2 bg-white rounded-lg border border-blue-150 flex justify-between text-xs">
                <span className="text-gray-500">Enrollment Status:</span>
                <span className="font-bold text-green-600">Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
