import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CreateCoursePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  async function handleCreateCourse(formData: FormData) {
    "use server"
    const code = formData.get("code") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const credits = parseInt(formData.get("credits") as string) || 3;

    const session = await auth();
    if (!session) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({ code, title, description, credits })
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Failed to create course:", err);
        return;
      }
    } catch (e) {
      console.error(e);
      return;
    }

    redirect("/lecturer");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/lecturer" className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition">
                SmartLearn AI
              </Link>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">
                Lecturer Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {session.user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/lecturer" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <span>&larr;</span> <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Create a New Course</h2>
          <p className="text-sm text-gray-500 mb-6">
            Provide the details below to add a new course. The course will immediately become available in the catalog.
          </p>

          <form action={handleCreateCourse} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              
              <div className="sm:col-span-3">
                <label htmlFor="code" className="block text-sm font-bold text-gray-700">Course Code</label>
                <input
                  type="text"
                  name="code"
                  id="code"
                  placeholder="e.g., CS205"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="credits" className="block text-sm font-bold text-gray-700">Credits</label>
                <select
                  id="credits"
                  name="credits"
                  defaultValue="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="1">1 Credit</option>
                  <option value="2">2 Credits</option>
                  <option value="3">3 Credits</option>
                  <option value="4">4 Credits</option>
                  <option value="5">5 Credits</option>
                </select>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="title" className="block text-sm font-bold text-gray-700">Course Title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  placeholder="e.g., Data Structures & Analysis"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="description" className="block text-sm font-bold text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Detailed course description, core themes, and prerequisites..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-150">
              <Link
                href="/lecturer"
                className="bg-white border border-gray-300 rounded-lg text-sm font-semibold py-2 px-4 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold py-2 px-4 shadow-sm transition"
              >
                Add Course
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
