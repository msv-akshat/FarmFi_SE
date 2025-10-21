import React from 'react';
import { Users, Table, CheckCircle, XCircle, ClipboardCheck, PieChart, TrendingUp, Download, Cog, FileSpreadsheet, Cloud, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const stats = {
    totalFarmers: 1245, approvedFarmers: 1183, pendingFarmers: 40, rejectedFarmers: 22,
    totalEmployees: 12, totalFields: 438, avgYield: 2.3
  };

  const pendingFarmers = [
    { id: 1, name: "Suresh Varma", crop: "Cotton", mandal: "Kothapet", status: "pending", employee: "emp001" },
    { id: 2, name: "Ravi Kumar", crop: "Maize", mandal: "Rampur", status: "pending", employee: "emp002" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-100">
      <div className="max-w-7xl mx-auto py-10 px-4">
        {/* Admin Overview */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-2"><Users className="w-7 h-7 text-green-500" /><div><div className="font-bold text-gray-800">Total Farmers</div><div className="text-2xl text-green-700">{stats.totalFarmers}</div></div></div>
          <div className="flex items-center gap-2"><ClipboardCheck className="w-7 h-7 text-teal-500" /><div><div className="font-bold text-gray-800">Pending</div><div className="text-2xl text-teal-700">{stats.pendingFarmers}</div></div></div>
          <div className="flex items-center gap-2"><XCircle className="w-7 h-7 text-red-500" /><div><div className="font-bold text-gray-800">Rejected</div><div className="text-2xl text-red-700">{stats.rejectedFarmers}</div></div></div>
          <div className="flex items-center gap-2"><Users className="w-7 h-7 text-blue-500" /><div><div className="font-bold text-gray-800">Employees</div><div className="text-2xl text-blue-700">{stats.totalEmployees}</div></div></div>
        </section>

        {/* Graphs and Analytics */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-bold text-teal-700 mb-2 flex items-center gap-2"><PieChart className="w-6 h-6" /> Crop Distribution</div>
            <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-lg h-40 flex items-center justify-center text-gray-500">Chart visualization coming soon</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-bold text-blue-700 mb-2 flex items-center gap-2"><TrendingUp className="w-6 h-6" /> Time-series Registrations</div>
            <div className="bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg h-40 flex items-center justify-center text-gray-500">Chart visualization coming soon</div>
          </div>
        </section>

        {/* Farmer Verification */}
        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Farmer Verification
          </h3>
          <div className="bg-white rounded-lg shadow p-6">
            <table className="w-full border rounded overflow-hidden">
              <thead>
                <tr className="bg-teal-50 text-teal-700">
                  <th className="px-2 py-2">Farmer</th>
                  <th>Crop</th>
                  <th>Mandal</th>
                  <th>Status</th>
                  <th>Employee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingFarmers.map(farmer => (
                  <tr key={farmer.id} className="hover:bg-green-50">
                    <td className="px-2 py-2">{farmer.name}</td>
                    <td>{farmer.crop}</td>
                    <td>{farmer.mandal}</td>
                    <td className="text-teal-700 font-semibold">{farmer.status}</td>
                    <td>{farmer.employee}</td>
                    <td>
                      <button className="px-3 py-1 bg-teal-500 text-white rounded font-bold">Approve</button>
                      <button className="px-3 py-1 bg-red-500 text-white rounded font-bold ml-2">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex gap-4 mt-4">
              <button className="px-4 py-2 bg-teal-600 text-white rounded font-bold"><Download className="mr-2" />Download Excel</button>
              <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold">Bulk Approve</button>
            </div>
          </div>
        </section>

        {/* Data Management and other modules */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-bold text-green-700 mb-2 flex items-center gap-2"><Cog className="w-6 h-6" /> Data Management</div>
            <div className="bg-gray-100 rounded-lg h-24 flex items-center justify-center text-gray-500">Farmer, employee, and crop management</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="font-bold text-blue-700 mb-2 flex items-center gap-2"><Shield className="w-6 h-6" /> Settings</div>
            <div className="bg-gray-100 rounded-lg h-24 flex items-center justify-center text-gray-500">API and role configuration</div>
          </div>
        </section>

        {/* Storage & Audit Log */}
        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Image Storage & Audit Log
          </h3>
          <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="font-bold text-teal-700 mb-2 flex items-center gap-2"><Cloud className="w-6 h-6" /> Leaf Images</div>
              <div className="h-24 bg-teal-50 rounded flex items-center justify-center text-gray-500">Image storage and search</div>
            </div>
            <div>
              <div className="font-bold text-gray-700 mb-2 flex items-center gap-2"><Table className="w-6 h-6" /> Action Logs</div>
              <div className="h-24 bg-gray-50 rounded flex items-center justify-center text-gray-500">Activity logs and CSV export</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
