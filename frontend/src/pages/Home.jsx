import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Cloud, ArrowRight, Sprout } from 'lucide-react';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Smart Analytics",
      description: "Data-driven insights to optimize your crop yields and maximize profits"
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud Platform",
      description: "Access your farm data anywhere, anytime with our secure cloud infrastructure"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Network",
      description: "Connect with fellow farmers and agricultural experts for knowledge sharing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Transforming Agriculture</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Empowering Farmers
              </span>
              <br />
              <span className="text-gray-800">with Technology</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your cloud-native agriculture platform for insights, analytics, and connectivity at your fingertips
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg hover:shadow-lg transition-all border-2 border-gray-200">
                Watch Demo
              </button>
            </div>

            {/* Hero Image/Visual */}
            <div className="mt-16 relative">
              <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                  <Sprout className="w-32 h-32 text-green-600 opacity-30" />
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-green-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose Udhyan Setu?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to modernize your farming operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
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

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-xl opacity-90">Active Farmers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-xl opacity-90">Acres Monitored</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">95%</div>
              <div className="text-xl opacity-90">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;