import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BarChart3, Camera, Settings, Zap } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: "Add New Field",
      description: "Register a new field",
      icon: <Plus className="w-7 h-7" />,
      link: "/my-fields/new",
      gradient: "from-green-500 via-emerald-500 to-teal-600",
      hoverGradient: "hover:from-green-600 hover:via-emerald-600 hover:to-teal-700"
    },
    {
      title: "View Predictions",
      description: "Check your predictions",
      icon: <BarChart3 className="w-7 h-7" />,
      link: "/predictions",
      gradient: "from-blue-500 via-indigo-500 to-purple-600",
      hoverGradient: "hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700"
    },
    {
      title: "Disease Detection",
      description: "Scan crop diseases",
      icon: <Camera className="w-7 h-7" />,
      link: "/disease-detection",
      gradient: "from-orange-500 via-red-500 to-pink-600",
      hoverGradient: "hover:from-orange-600 hover:via-red-600 hover:to-pink-700"
    },
    {
      title: "Settings",
      description: "Manage preferences",
      icon: <Settings className="w-7 h-7" />,
      link: "/settings",
      gradient: "from-gray-500 via-slate-600 to-gray-700",
      hoverGradient: "hover:from-gray-600 hover:via-slate-700 hover:to-gray-800"
    }
  ];

  return (
    <section className="w-full bg-gradient-to-br from-white to-blue-50/30 rounded-xl shadow-lg p-7 border border-blue-100">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Quick Actions
        </h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.link}
            className={`
              group relative overflow-hidden
              bg-gradient-to-r ${action.gradient} ${action.hoverGradient}
              text-white p-5 rounded-xl 
              flex flex-col items-center gap-2
              hover:scale-105 hover:shadow-xl
              transition-all duration-300
              border border-white/20
            `}
          >
            {/* Animated background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-2 group-hover:bg-white/30 transition-colors duration-300">
                {action.icon}
              </div>
              <span className="text-sm font-bold text-center block">{action.title}</span>
              <span className="text-xs text-white/80 text-center block mt-1">{action.description}</span>
            </div>
            
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full"></div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
