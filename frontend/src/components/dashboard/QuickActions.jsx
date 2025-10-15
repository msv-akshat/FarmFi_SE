import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Camera, Settings } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: "Add New Field",
      icon: <Plus className="w-6 h-6" />,
      link: "/my-fields/new",
      color: "from-green-500 to-teal-600"
    },
    {
      title: "View Predictions",
      icon: <BarChart3 className="w-6 h-6" />,
      link: "/predictions",
      color: "from-blue-500 to-purple-600"
    },
    {
      title: "Disease Detection",
      icon: <Camera className="w-6 h-6" />,
      link: "/disease-detection",
      color: "from-orange-500 to-red-600"
    },
    {
      title: "Settings",
      icon: <Settings className="w-6 h-6" />,
      link: "/settings",
      color: "from-gray-500 to-gray-700"
    }
  ];

  return (
    <section className="w-full bg-white rounded-lg shadow p-7">
      <div className="text-xl font-bold text-teal-700 mb-4">Quick Actions</div>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`bg-gradient-to-r ${action.color} text-white p-4 rounded-lg flex flex-col items-center gap-2 hover:scale-105 transition-transform shadow`}
          >
            {action.icon}
            <span className="text-sm font-semibold text-center">{action.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
