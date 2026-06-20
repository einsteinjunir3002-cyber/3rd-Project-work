import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getAllCourses(token: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses`, {
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

export default async function CourseCatalog() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const courses = await getAllCourses(session.user.accessToken);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-blue-600">SmartLearn AI</h1>
              <div className="hidden md:flex space-x-4">
                <Link href={`/${session.user.roles[0]?.toLowerCase() || 'student'}`} className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">Dashboard</Link>
                <Link href="/courses" className="text-blue-600 bg-blue-50 px-3 py-2 rounded-md text-sm font-medium">Course Catalog</Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {session.user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Course Catalog</h2>
          <p className="mt-2 text-gray-600">Browse and enroll in available courses.</p>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
            <p className="text-gray-500">No courses are available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-xs font-bold text-blue-600 tracking-wider uppercase">{course.code}</div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {course.credits} Credits
                  </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h4>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description || "No description provided."}</p>
                <div className="flex items-center mb-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs">
                    {course.instructor?.firstName?.[0]}{course.instructor?.lastName?.[0]}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{course.instructor?.firstName} {course.instructor?.lastName}</span>
                </div>
                
                <form action={async () => {
                  "use server"
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/enrollments`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${session.user.accessToken}`
                    },
                    body: JSON.stringify({ courseId: course.id })
                  });
                  redirect('/student');
                }}>
                  <button className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                    Enroll Now
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
