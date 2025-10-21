const RecentActivity = ({ fields }) => {
  // Assume each field has an updated_at or created_at
  const activities = [...fields].sort((a,b)=>new Date(b.updated_at||b.created_at)-new Date(a.updated_at||a.created_at)).slice(0,5);
  return (
    <>
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Activity</h3>
      <ul className="divide-y divide-gray-200">
        {activities.map((f, i) => (
          <li key={f.id} className="py-2 flex items-center">
            <span className="text-green-600 font-semibold mr-2">{f.field_name}</span>
            <span className="text-xs text-gray-500">{f.crop_name || 'No crop'}</span>
            <span className="ml-auto text-xs text-gray-400">{new Date(f.updated_at || f.created_at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </>
  );
};
export default RecentActivity;
