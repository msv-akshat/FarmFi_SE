import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit3, MapPin, Sprout } from 'lucide-react';

const FieldsQuickTable = ({ fields }) => {
  const topFields = fields.slice(0, 3); // Show top 3 fields

  const getStatusColor = (status) => {
    const colors = {
      verified: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-blue-100 text-blue-700 border-blue-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <section className="w-full bg-gradient-to-br from-white to-teal-50/30 rounded-xl shadow-lg p-7 border border-teal-100">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-teal-600" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-green-600 bg-clip-text text-transparent">
            Recent Fields
          </h3>
        </div>
        <Link 
          to="/my-fields" 
          className="px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold text-sm"
        >
          View All →
        </Link>
      </div>
      
      {topFields.length > 0 ? (
        <div className="space-y-3">
          {topFields.map(field => (
            <div 
              key={field.id} 
              className="group bg-white hover:bg-gradient-to-r hover:from-teal-50 hover:to-green-50 border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:shadow-md hover:border-teal-300"
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-bold text-gray-800 text-lg">{field.field_name}</div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${getStatusColor(field.status)}`}>
                      {field.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Sprout className="w-4 h-4 text-green-600" />
                      {field.crop_name}
                    </span>
                    <span className="font-semibold text-teal-600">
                      {field.area} ha
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Link 
                    to={`/my-fields/${field.id}`} 
                    className="flex items-center gap-1 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-semibold text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  <Link 
                    to={`/my-fields/${field.id}/edit`} 
                    className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-teal-50 rounded-xl border-2 border-dashed border-teal-200">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-teal-400" />
          <p className="text-gray-600 mb-2">No fields yet</p>
          <Link 
            to="/my-fields/new" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
          >
            Add your first field
          </Link>
        </div>
      )}
    </section>
  );
};

export default FieldsQuickTable;
