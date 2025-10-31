import { Link } from 'react-router-dom'
import { BarChart3, ShieldCheck, Users, ArrowRight, Leaf, TrendingUp, Bell } from 'lucide-react'
import navLogo from '../assets/navlogo.png'
import heroImage from '../assets/farmfi-hero.png.jpg'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={navLogo} alt="FarmFi Logo" className="h-10 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/admin/login" className="text-gray-500 hover:text-purple-600 font-medium transition-colors text-sm">
                Admin
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Smart Farming for a
                <span className="text-primary-600"> Better Tomorrow</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Empower your farm with AI-powered disease detection, real-time analytics, and comprehensive field management. Join thousands of farmers growing smarter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="btn-primary inline-flex items-center justify-center">
                  Register as farmer
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link to="/login" className="btn-secondary inline-flex items-center justify-center">
                  Sign In
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-primary-600">1000+</div>
                  <div className="text-gray-600">Farmers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">5000+</div>
                  <div className="text-gray-600">Fields</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">99%</div>
                  <div className="text-gray-600">Accuracy</div>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={heroImage} 
                  alt="FarmFi Smart Farming" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Your Farm
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools designed specifically for modern farmers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card group hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <ShieldCheck className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Disease Detection</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload crop images and get instant disease diagnosis with 99% accuracy. Our AI analyzes thousands of patterns to protect your harvest.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card group hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <Leaf className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Field Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize multiple fields, track crop seasons (Rabi, Kharif, Whole Year), and monitor growth cycles with precision.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card group hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <BarChart3 className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Get detailed insights on field performance, crop health trends, and prediction history with beautiful visualizations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card group hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <Users className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Verification System</h3>
              <p className="text-gray-600 leading-relaxed">
                Fields and crops are verified by agricultural employees and approved by admins ensuring data accuracy and government compliance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="card group hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <TrendingUp className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Predictions</h3>
              <p className="text-gray-600 leading-relaxed">
                Access complete prediction history with filtering by severity, crop type, and time period for better decision making.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="card group hover:shadow-xl transition-shadow duration-300">
              <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <Bell className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Season Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Intelligent season tracking prevents crop conflicts - manage Rabi, Kharif, and whole-year crops without overlaps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to transform your farming experience
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Register</h3>
              <p className="text-gray-600">Sign up with your phone number and location details</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Fields</h3>
              <p className="text-gray-600">Register your fields with location and size information</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Plant Crops</h3>
              <p className="text-gray-600">Add crops with season details and track growth</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Monitor Health</h3>
              <p className="text-gray-600">Upload images for AI disease detection and analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Farming?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of farmers who are already using FarmFi to increase their yields and protect their crops
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-primary-50 font-semibold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center">
              Create Free Account
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/login" className="bg-primary-700 text-white hover:bg-primary-800 font-semibold py-4 px-8 rounded-lg border-2 border-white transition-all duration-200 inline-flex items-center justify-center">
              Sign In Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src={navLogo} alt="FarmFi Logo" className="h-8 w-auto brightness-0 invert" />
              </div>
              <p className="text-sm">Smart farming solutions powered by AI technology.</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 FarmFi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
