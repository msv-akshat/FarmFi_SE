import React, { useState, useEffect } from 'react';
import { Database, TrendingUp, Brain, Users, CheckCircle, FileSpreadsheet, Shield, Cloud, ArrowRight, Leaf } from 'lucide-react';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Smart Data Management",
      description: "Centralized farmer data with validation workflows. Register via forms or bulk Excel uploads with admin approval system."
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Disease Detection",
      description: "Upload plant leaf images for instant disease identification and get AI-powered recommendations for treatment."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Crop Yield Analytics",
      description: "Predictive insights on crop yields based on historical data, regional patterns, and real-time monitoring."
    },
    {
      icon: <FileSpreadsheet className="w-8 h-8" />,
      title: "Advanced Reporting",
      description: "Download detailed reports filtered by mandal, village, and crop type. Track cultivation areas and farmer counts."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Validation Workflow",
      description: "Multi-level approval system ensures data accuracy. Admins review and approve all farmer registrations."
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud-Native Platform",
      description: "Built on modern cloud infrastructure with Supabase/PostgreSQL for scalable, reliable data storage."
    }
  ];

  const userRoles = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Farmers",
      points: ["Easy registration process", "Upload crop images for disease detection", "Track cultivation data", "Access personalized insights"]
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6" />,
      title: "Employees",
      points: ["Bulk data uploads via Excel", "Assist farmers with registration", "Generate custom reports", "Support data collection"]
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Administrators",
      points: ["Validate farmer records", "Approve/reject entries", "Centralized dashboard access", "Oversee all workflows"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-8 border border-teal-100">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Bridging Farmers with Smart Agriculture</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-teal-600 via-green-600 to-teal-700 bg-clip-text text-transparent">
                Empowering Farmers
              </span>
              <br />
              <span className="text-gray-800">with AI & Analytics</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              A cloud-native platform for farmer data management, crop yield analysis, and AI-powered disease detection. Helping farmers and administrators make smarter decisions for healthier harvests.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg hover:shadow-lg transition-all border-2 border-teal-200">
                Watch Demo
              </button>
            </div>

            {/* Key Highlights */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-teal-100">
                <CheckCircle className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Data Validation</h3>
                <p className="text-sm text-gray-600">Multi-level approval workflow</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-green-100">
                <Brain className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">AI Detection</h3>
                <p className="text-sm text-gray-600">Smart disease identification</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Yield Forecasting</h3>
                <p className="text-sm text-gray-600">Predictive crop analytics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/50" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Comprehensive Features
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need for modern agricultural data management
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="py-20 px-6" id="about">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Built for Everyone
            </h2>
            <p className="text-xl text-gray-600">
              Role-based access for farmers, employees, and administrators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userRoles.map((role, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-100 hover:border-teal-300 transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-green-500 rounded-xl flex items-center justify-center mb-6">
                  <div className="text-white">
                    {role.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {role.title}
                </h3>
                <ul className="space-y-3">
                  {role.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-teal-600 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Leaf className="absolute top-10 left-10 w-32 h-32 transform rotate-12" />
          <Leaf className="absolute bottom-10 right-10 w-40 h-40 transform -rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Making an Impact
            </h2>
            <p className="text-xl text-teal-50">
              Connecting farms with the future
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">Cloud-Native</div>
              <div className="text-xl opacity-90">Scalable Infrastructure</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">AI-Powered</div>
              <div className="text-xl opacity-90">Disease Detection</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">Real-Time</div>
              <div className="text-xl opacity-90">Data Analytics</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">Multi-Level</div>
              <div className="text-xl opacity-90">Data Validation</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join Udhyan Setu today and experience the future of smart agriculture
          </p>
          <button className="px-10 py-4 bg-gradient-to-r from-teal-500 to-green-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all">
            Start Your Journey
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;