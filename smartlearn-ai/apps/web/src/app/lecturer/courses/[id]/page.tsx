import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";

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

export default async function LecturerCourseDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const course = await getCourseDetails(params.id, session.user.accessToken);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Course Not Found</h2>
        <Link href="/lecturer" className="bg-indigo-650 text-white py-2 px-4 rounded-lg">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Server Action to handle assignment creation
  async function handleAddAssignment(formData: FormData) {
    "use server"
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const totalPoints = parseInt(formData.get("points") as string) || 100;
    const dueDate = formData.get("dueDate") as string;

    const session = await auth();
    if (!session) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          courseId: params.id,
          title,
          description,
          totalPoints,
          dueDate: new Date(dueDate).toISOString()
        })
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Failed to add assignment:", err);
      }
    } catch (e) {
      console.error(e);
    }

    revalidatePath(`/lecturer/courses/${params.id}`);
  }

  // Server Action to handle course material (PDF) adding
  async function handleAddMaterial(formData: FormData) {
    "use server"
    const title = formData.get("title") as string;
    const fileUrl = formData.get("fileUrl") as string;

    const session = await auth();
    if (!session) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/courses/${params.id}/materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.user.accessToken}`
        },
        body: JSON.stringify({
          title,
          fileUrl
        })
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Failed to add material:", err);
      }
    } catch (e) {
      console.error(e);
    }

    revalidatePath(`/lecturer/courses/${params.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/lecturer" className="text-xl font-bold text-indigo-650 hover:text-indigo-700 transition">
                SmartLearn AI
              </Link>
              <span className="px-2.5 py-0.5 bg-indigo-150 text-indigo-800 text-xs font-semibold rounded-full">
                Lecturer Portal
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

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/lecturer" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1">
            <span>&larr;</span> <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Course Title Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <div className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">
                {course.code} &bull; {course.program?.name || "Program"}
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{course.title}</h2>
            </div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 self-start sm:self-auto">
              {course.credits} Credits
            </div>
          </div>
        </div>

        {/* Course Details Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main List Column (Left 2 columns) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Existing Materials */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Course Materials</h3>
              {!course.materials || course.materials.length === 0 ? (
                <p className="text-sm text-gray-500">No materials uploaded for this course yet.</p>
              ) : (
                <div className="space-y-3">
                  {course.materials.map((material: any) => (
                    <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-150">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-900">{material.title}</span>
                      </div>
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Existing Assignments */}
            <section className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">Course Assignments</h3>
              {!course.assignments || course.assignments.length === 0 ? (
                <p className="text-sm text-gray-500">No assignments configured for this course yet.</p>
              ) : (
                <div className="space-y-4">
                  {course.assignments.map((assignment: any) => (
                    <div key={assignment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-150">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-gray-900">{assignment.title}</h4>
                        <span className="text-xs font-semibold text-gray-500">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{assignment.description || "No description provided."}</p>
                      <div className="text-xs text-indigo-700 font-bold">Total Points: {assignment.totalPoints}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Form Side Column (Right 1 column) */}
          <div className="space-y-6">
            
            {/* Form: Add Material */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Add Course Material</h3>
              <form action={handleAddMaterial} className="space-y-4">
                <div>
                  <label htmlFor="material_title" className="block text-xs font-bold text-gray-700">Document Title</label>
                  <input
                    type="text"
                    name="title"
                    id="material_title"
                    placeholder="e.g., Week 1 Syllabus"
                    required
                    className="mt-1 block w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="material_file" className="block text-xs font-bold text-gray-700">Select PDF Textbook</label>
                  <select
                    name="fileUrl"
                    id="material_file"
                    className="mt-1 block w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="/materials/cs_programming.pdf">CS Programming.pdf</option>
                    <option value="/materials/bus_marketing.pdf">Business Marketing.pdf</option>
                    <option value="/materials/eng_shakespeare.pdf">English Shakespeare.pdf</option>
                    <option value="/materials/mech_thermo.pdf">Mechanical Thermodynamics.pdf</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition"
                >
                  Attach Material PDF
                </button>
              </form>
            </div>

            {/* Form: Add Assignment */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Add Assignment</h3>
              <form action={handleAddAssignment} className="space-y-4">
                <div>
                  <label htmlFor="assign_title" className="block text-xs font-bold text-gray-700">Assignment Title</label>
                  <input
                    type="text"
                    name="title"
                    id="assign_title"
                    placeholder="e.g., Homework 1"
                    required
                    className="mt-1 block w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label htmlFor="assign_desc" className="block text-xs font-bold text-gray-700">Description</label>
                  <textarea
                    name="description"
                    id="assign_desc"
                    rows={2}
                    placeholder="Instructions..."
                    className="mt-1 block w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="assign_points" className="block text-xs font-bold text-gray-700">Max Points</label>
                    <input
                      type="number"
                      name="points"
                      id="assign_points"
                      defaultValue="100"
                      className="mt-1 block w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label htmlFor="assign_due" className="block text-xs font-bold text-gray-700">Due Date</label>
                    <input
                      type="date"
                      name="dueDate"
                      id="assign_due"
                      required
                      className="mt-1 block w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg shadow-sm transition"
                >
                  Create Assignment
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
