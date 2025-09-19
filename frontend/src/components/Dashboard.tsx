import React, { useState } from 'react';
import { ArrowLeft, Plus, User, MapPin, Calendar, Droplets, Package2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FarmData, UserData } from '../App';

interface DashboardProps {
  userData: UserData;
  farmData: FarmData;
  selectedCrop: any;
  onNewPlan: () => void;
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userData, 
  farmData, 
  selectedCrop, 
  onNewPlan, 
  onBack 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Generate calendar activities
  const generateActivities = () => {
    const activities: { [key: string]: Array<{ activity: string; type: 'watering' | 'fertilizing' | 'other'; color: string }> } = {};
    const today = new Date();
    
    // Generate activities for the next 60 days
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayActivities = [];
      
      // Watering schedule (every 2-3 days)
      if (i % 3 === 0) {
        dayActivities.push({
          activity: 'Water crops - Check soil moisture and irrigate as needed',
          type: 'watering' as const,
          color: 'bg-blue-500'
        });
      }
      
      // Fertilizing schedule (weekly)
      if (i % 7 === 0 && i > 0) {
        dayActivities.push({
          activity: 'Apply fertilizer - Follow the recommended NPK schedule',
          type: 'fertilizing' as const,
          color: 'bg-amber-600'
        });
      }
      
      // Other activities
      if (i % 10 === 5) {
        dayActivities.push({
          activity: 'Pest inspection - Check plants for signs of pests or diseases',
          type: 'other' as const,
          color: 'bg-green-600'
        });
      }
      
      if (i % 14 === 7) {
        dayActivities.push({
          activity: 'Soil testing - Monitor pH and nutrient levels',
          type: 'other' as const,
          color: 'bg-purple-600'
        });
      }
      
      if (dayActivities.length > 0) {
        activities[dateKey] = dayActivities;
      }
    }
    
    return activities;
  };

  const activities = generateActivities();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || days.length % 7 !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const days = getDaysInMonth(currentDate);
  const today = new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-green-700 hover:text-green-800 mb-4 sm:mb-0 text-lg font-medium"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back to Plan
          </button>
          
          <button
            onClick={onNewPlan}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Plan
          </button>
        </div>

        {/* Dashboard Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8">
            <h1 className="text-4xl font-bold text-white mb-2">Farmer Dashboard</h1>
            <p className="text-green-100 text-xl">Welcome back to your farming journey!</p>
          </div>

          {/* Farmer Info */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <User className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Name</p>
                  <p className="text-gray-800 font-bold text-lg">{userData.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <MapPin className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Location</p>
                  <p className="text-gray-800 font-bold text-lg">{farmData.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Package2 className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Farm Size</p>
                  <p className="text-gray-800 font-bold text-lg">{farmData.farmSize}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  {selectedCrop && selectedCrop.icon && <selectedCrop.icon className="w-8 h-8 text-green-600" />}
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">Current Crop</p>
                  <p className="text-gray-800 font-bold text-lg">{selectedCrop?.name || 'None'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Farm Activity Calendar</h2>
                <p className="text-blue-100">Plan and track your daily farming activities</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <h3 className="text-2xl font-bold text-white min-w-48 text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-lg transition-all"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Legend */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-gray-700 font-medium">Watering</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-amber-600 rounded"></div>
                <span className="text-gray-700 font-medium">Fertilizing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-gray-700 font-medium">Inspection</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-purple-600 rounded"></div>
                <span className="text-gray-700 font-medium">Testing</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-bold text-gray-600 py-3">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {days.map((day, index) => {
                const dateKey = day.toISOString().split('T')[0];
                const dayActivities = activities[dateKey] || [];
                const isToday = day.toDateString() === today.toDateString();
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      isToday 
                        ? 'bg-green-100 border-green-500' 
                        : isCurrentMonth 
                        ? 'bg-white border-gray-200 hover:border-green-300' 
                        : 'bg-gray-50 border-gray-100 text-gray-400'
                    }`}
                    onClick={() => dayActivities.length > 0 && setSelectedDate(day)}
                  >
                    <div className={`font-bold mb-1 ${isToday ? 'text-green-700' : isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayActivities.slice(0, 2).map((activity, actIndex) => (
                        <div key={actIndex} className={`text-xs text-white px-1 py-0.5 rounded ${activity.color}`}>
                          {activity.type === 'watering' ? 'Water' : activity.type === 'fertilizing' ? 'Fertilize' : activity.activity.split(' ')[0]}
                        </div>
                      ))}
                      {dayActivities.length > 2 && (
                        <div className="text-xs text-gray-600">+{dayActivities.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  Activities for {formatDate(selectedDate)}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {activities[selectedDate.toISOString().split('T')[0]]?.map((activity, index) => (
                  <div key={index} className="border-l-4 border-l-green-500 pl-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${activity.color}`}></div>
                      <span className="font-semibold text-gray-800 capitalize">{activity.type}</span>
                    </div>
                    <p className="text-gray-700">{activity.activity}</p>
                  </div>
                )) || (
                  <p className="text-gray-600 text-center">No activities scheduled for this day.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;