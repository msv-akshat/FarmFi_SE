import React from 'react';
import { Link } from 'react-router-dom';

const FieldsQuickTable = ({ fields }) => {
  const topFields = fields.slice(0, 3); // Show top 3 fields

  return (
    <section className="w-full bg-white rounded-lg shadow p-7">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xl font-bold text-teal-700">Recent Fields</div>
        <Link to="/my-fields" className="text-teal-600 hover:underline font-semibold">
          View All →
        </Link>
      </div>
      {topFields.length > 0 ? (
        <div className="space-y-3">
          {topFields.map(field => (
            <div key={field.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-800">{field.field_name}</div>
                <div className="text-sm text-gray-600">
                  {field.crop_name} • {field.area} ha • {field.status}
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/my-fields/${field.id}`} className="text-teal-600 text-sm hover:underline">
                  View
                </Link>
                <Link to={`/my-fields/${field.id}/edit`} className="text-blue-600 text-sm hover:underline">
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          No fields yet. <Link to="/my-fields/new" className="text-teal-600 hover:underline">Add your first field</Link>
        </div>
      )}
    </section>
  );
};

export default FieldsQuickTable;
