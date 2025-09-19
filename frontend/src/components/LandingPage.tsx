import React from 'react';
import { Sprout, Users, Target, Award } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const teamMembers = [
    { name: 'Dr. Sarah Johnson', role: 'Agricultural Scientist' },
    { name: 'Mike Chen', role: 'AI Engineer' },
    { name: 'Emma Rodriguez', role: 'Crop Specialist' },
    { name: 'David Kumar', role: 'Sustainability Expert' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-green-600 p-4 rounded-full mr-4">
              <Sprout className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-green-800">
              AI-Powered Crop
              <br />
              <span className="text-green-600">Diversification Advisor</span>
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Maximize your harvest potential with intelligent crop recommendations 
            tailored to your soil, climate, and farming goals
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Target className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Planning</h3>
              <p className="text-gray-600">AI-driven crop selection based on your unique farm conditions</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Expert Guidance</h3>
              <p className="text-gray-600">Professional insights from agricultural specialists</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <Award className="w-12 h-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Proven Results</h3>
              <p className="text-gray-600">Increase yield and sustainability with data-driven decisions</p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Meet Our Expert Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center">
                    <Users className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-gray-600 font-medium">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="relative mb-12">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-96 h-96 border-4 border-green-300 rounded-full"></div>
            <div className="w-64 h-64 border-4 border-blue-300 rounded-full absolute"></div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-green-500"
          >
            GET STARTED
          </button>
          <p className="text-gray-600 mt-4 text-lg">
            Start your journey to better crops today!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;