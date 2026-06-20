"use client";

import { useState } from "react";

export default function AdminDashboardClient({ 
  initialMetrics, 
  initialUsers, 
  initialStructure,
  accessToken
}: {
  initialMetrics: any;
  initialUsers: any[];
  initialStructure: any[];
  accessToken: string;
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [users, setUsers] = useState(initialUsers);

  const handleRoleChange = async (userId: string, newRoles: string[]) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ roles: newRoles }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, roles: newRoles } : u));
        alert("Roles updated successfully");
      } else {
        alert("Failed to update role");
      }
    } catch (e) {
      alert("Error updating role");
    }
  };

  return (
    <div>
      <div className="mb-6 flex space-x-4 border-b border-gray-700 pb-2">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 font-semibold ${activeTab === "overview" ? "text-teal-400 border-b-2 border-teal-400" : "text-gray-400 hover:text-gray-300"}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-semibold ${activeTab === "users" ? "text-teal-400 border-b-2 border-teal-400" : "text-gray-400 hover:text-gray-300"}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab("structure")}
          className={`px-4 py-2 font-semibold ${activeTab === "structure" ? "text-teal-400 border-b-2 border-teal-400" : "text-gray-400 hover:text-gray-300"}`}
        >
          University Structure
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-300">Total Users</h3>
              <p className="mt-1 text-3xl font-semibold text-teal-400">{initialMetrics.totalUsers}</p>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-300">Active Students</h3>
              <p className="mt-1 text-3xl font-semibold text-amber-400">{initialMetrics.students}</p>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-300">Researchers</h3>
              <p className="mt-1 text-3xl font-semibold text-rose-400">{initialMetrics.researchers || 0}</p>
            </div>
          </div>
          <div className="bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-300">Business Partners</h3>
              <p className="mt-1 text-3xl font-semibold text-indigo-400">{initialMetrics.industryPartners || 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-gray-800 shadow rounded-lg border border-gray-700 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Roles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{u.firstName} {u.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{u.roles.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <select 
                      className="bg-gray-700 text-white rounded p-1"
                      value={u.roles[0]}
                      onChange={(e) => handleRoleChange(u.id, [e.target.value])}
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="LECTURER">LECTURER</option>
                      <option value="RESEARCHER">RESEARCHER</option>
                      <option value="INDUSTRY_PARTNER">BUSINESS PARTNER</option>
                      <option value="ALUMNI">ALUMNI</option>
                      <option value="SYSTEM_ADMINISTRATOR">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "structure" && (
        <div className="space-y-6">
          {initialStructure.map(faculty => (
            <div key={faculty.id} className="bg-gray-800 shadow rounded-lg border border-gray-700 p-6">
              <h3 className="text-xl font-bold text-teal-400 mb-4">{faculty.name} ({faculty.code})</h3>
              <ul className="list-disc pl-5 text-gray-300">
                {faculty.departments.map((dept: any) => (
                  <li key={dept.id}>{dept.name} ({dept.code})</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
