import React from 'react';
import { Users, Upload, Table, ClipboardCheck, Filter, FileSpreadsheet, TrendingUp } from 'lucide-react';

const EmployeeDashboard = () => {
  // Replace with API/data hookup!
  const uploadsToday = 47;
  const pendingApprovals = 11;
  const rejectedRecords = 2;
  const farmerUploads = [
    { id: 1, name: "Anil Kumar", crop: "Maize", village: "Rampur", status: "pending", date: "2025-10-12" },
    { id: 2, name: "Suresh Verma", crop: "Cotton", village: "Kothapet", status: "pending", date: "2025-10-12" },
  ];
  // Dummy employee info for profile section

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50">
      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Home Overview */}
        <section className="bg-white rounded-xl shadow-lg p-8 mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-7 h-7 text-green-500" />
            <div>
              <div className="font-bold text-gray-800">Farmers Uploaded Today</div>
              <div className="text-2xl text-green-700">{uploadsToday}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-7 h-7 text-teal-500" />
            <div>
              <div className="font-bold text-gray-800">Pending Approvals</div>
              <div className="text-2xl text-teal-700">{pendingApprovals}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Table className="w-7 h-7 text-red-500" />
            <div>
              <div className="font-bold text-gray-800">Rejected Records</div>
              <div className="text-2xl text-red-700">{rejectedRecords}</div>
            </div>
          </div>
        </section>

        {/* Upload Farmer Data */}
        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-700 mb-4">🧾 Upload Farmer Data</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="font-bold text-teal-700 mb-2 flex gap-2 items-center"><Upload /> Form Upload</div>
              <form className="grid gap-4">
                {/* Basic fields; wire up to API later */}
                <input type="text" placeholder="Farmer Name" className="border rounded-md px-3 py-2" />
                <input type="text" placeholder="Phone" className="border rounded-md px-3 py-2" />
                <input type="text" placeholder="Village" className="border rounded-md px-3 py-2" />
                <input type="text" placeholder="Crop Name" className="border rounded-md px-3 py-2" />
                <button type="button" className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold">Upload Farmer</button>
              </form>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="font-bold text-teal-700 mb-2 flex gap-2 items-center"><FileSpreadsheet /> Excel Upload</div>
              <input type="file" accept=".xlsx,.xls" className="block mb-2" />
              <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold">Upload Excel</button>
              <div className="text-sm mt-2 text-gray-400">Allowed columns: Name, Phone, Village, Crop...</div>
            </div>
          </div>
        </section>

        {/* Review Pending Data */}
        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-700 mb-4">🔍 Review Pending Data</h3>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap gap-6 mb-3">
              <div className="flex items-center gap-1"><Filter /> Mandal: <select className="border rounded px-2 py-1 ml-1"><option>All</option></select></div>
              <div className="flex items-center gap-1">Village: <select className="border rounded px-2 py-1 ml-1"><option>All</option></select></div>
              <div className="flex items-center gap-1">Crop: <select className="border rounded px-2 py-1 ml-1"><option>All</option></select></div>
            </div>
            <table className="w-full border">
              <thead>
                <tr className="bg-teal-50 text-teal-700">
                  <th className="px-2 py-2">Farmer</th>
                  <th>Crop</th>
                  <th>Village</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {farmerUploads.map(farmer => (
                  <tr key={farmer.id} className="hover:bg-green-50">
                    <td className="px-2 py-2">{farmer.name}</td>
                    <td>{farmer.crop}</td>
                    <td>{farmer.village}</td>
                    <td className="text-teal-700 font-semibold">{farmer.status}</td>
                    <td className="text-xs text-gray-400">{farmer.date}</td>
                    <td>
                      <button className="px-3 py-1 bg-teal-500 text-white rounded font-bold">Edit</button>
                      <button className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold ml-2">Submit for Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Analytics */}
        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-700 mb-4">🧮 Analytics</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="font-bold text-green-700 mb-1">Farmers per Mandal</div>
              <div className="h-20 flex items-center justify-center text-gray-500">[Chart]</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="font-bold text-teal-700 mb-1">Total Area Uploaded</div>
              <div className="h-20 flex items-center justify-center text-gray-500">[Chart]</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="font-bold text-blue-700 mb-1">Upload Efficiency</div>
              <div className="h-20 flex items-center justify-center text-gray-500">[Chart]</div>
            </div>
          </div>
        </section>

        {/* Profile & Logs */}
        <section>
          <h3 className="text-xl font-bold text-gray-700 mb-4">👤 Profile & Logs</h3>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex flex-col gap-2">
              <div><span className="font-bold text-gray-700">Username:</span> emp001</div>
              <div><span className="font-bold text-gray-700">Email:</span> emp001@domain.com</div>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded font-bold hover:shadow hover:scale-105 transition">Edit Profile</button>
            {/* Show upload table below for logs */}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
