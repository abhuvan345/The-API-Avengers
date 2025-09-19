import React from "react";
import cropFarmActivities from "../data/cropFarmActivities";
import { Calendar, AlertCircle, CheckCircle } from "lucide-react";

interface FarmActivityCalendarProps {
  cropName: string;
}

const FarmActivityCalendar: React.FC<FarmActivityCalendarProps> = ({
  cropName,
}) => {
  const normalizedCropName = cropName.toLowerCase();

  // Get activities for the specified crop, or return null if not found
  const farmActivities = cropFarmActivities[normalizedCropName];

  if (!farmActivities) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700">
            Farm Activity Calendar not available for {cropName}
          </h3>
        </div>
      </div>
    );
  }

  // Month names for display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Get current month to highlight
  const currentMonth = new Date().getMonth() + 1; // 1-12 format

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-6 h-6 text-green-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">
            Farm Activity Calendar for {cropName}
          </h2>
        </div>

        <p className="text-gray-600 mb-6">{farmActivities.notes}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmActivities.activities
            .sort((a, b) => a.month - b.month) // Ensure months are sorted
            .map((monthActivity) => (
              <div
                key={monthActivity.month}
                className={`border rounded-lg overflow-hidden h-full 
                  ${
                    monthActivity.month === currentMonth
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-green-700">
                      {monthNames[monthActivity.month - 1]}
                    </h3>
                    {monthActivity.critical ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Critical Period
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        <Calendar className="w-3 h-3 mr-1" />
                        Preparation
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2 pl-5 list-disc">
                    {monthActivity.activities.map((activity, index) => (
                      <li key={index} className="text-sm text-gray-700">
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FarmActivityCalendar;
