import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Droplets,
  Leaf,
  Target,
  TrendingUp,
  AlertCircle,
  Loader2,
  Sun,
  Thermometer,
  MapPin,
  Beaker,
} from "lucide-react";

interface CropPlanPageProps {
  selectedCrop: {
    name: string;
    confidence: number;
    expectedIncome: string;
    rank: number;
  } | null;
  onNext: () => void;
  onBack: () => void;
}

interface CropStage {
  stage: string;
  duration_days: number;
  description: string;
}

interface CropPlan {
  name: string;
  duration_days: number;
  best_planting_months: number[];
  water_requirement: string;
  fertilizer: string;
  soil_ph_range: string;
  temperature_range: string;
  stages: CropStage[];
  tips: string[];
  recommended_planting_date?: string;
  soil_specific_tips?: string[];
  weather_specific_tips?: string[];
  farm_size_acres?: number;
  scale_tips?: string[];
  generated_date?: string;
  crop_category?: string;
}

const CropPlanPage: React.FC<CropPlanPageProps> = ({
  selectedCrop,
  onNext,
  onBack,
}) => {
  const [cropPlan, setCropPlan] = useState<CropPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Crop icon mapping
  const getCropIcon = (cropName: string) => {
    const iconMap: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      rice: Leaf,
      wheat: Leaf,
      maize: Leaf,
      chickpea: Leaf,
      kidneybeans: Leaf,
      pigeonpeas: Leaf,
      mothbeans: Leaf,
      mungbean: Leaf,
      blackgram: Leaf,
      lentil: Leaf,
      pomegranate: Sun,
      banana: Sun,
      mango: Sun,
      grapes: Sun,
      watermelon: Sun,
      muskmelon: Sun,
      apple: Sun,
      orange: Sun,
      papaya: Sun,
      coconut: Sun,
      cotton: Leaf,
      jute: Leaf,
      coffee: Leaf,
    };
    return iconMap[cropName.toLowerCase()] || Leaf;
  };

  const fetchCropPlan = React.useCallback(async () => {
    if (!selectedCrop) {
      setError("No crop selected");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user location and soil preferences from localStorage if available
      const location = localStorage.getItem("user_location") || "";
      const soilType = localStorage.getItem("preferred_soil") || "";
      const farmSize = localStorage.getItem("farm_size") || "";

      let url = `http://localhost:5002/crop-plan/${selectedCrop.name.toLowerCase()}`;
      const params = new URLSearchParams();

      if (location) params.append("location", location);
      if (soilType) params.append("soil_type", soilType);
      if (farmSize) params.append("farm_size", farmSize);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setCropPlan(data.crop_plan);
      } else {
        setError(data.message || "Failed to load crop plan");
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
      console.error("Error fetching crop plan:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCrop]);

  useEffect(() => {
    fetchCropPlan();
  }, [fetchCropPlan]);

  const formatDuration = (days: number): string => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  const getMonthName = (monthNumber: number): string => {
    const months = [
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
    return months[monthNumber - 1] || "Unknown";
  };

  // Check if no crop is selected
  if (!selectedCrop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={onBack}
            className="flex items-center text-green-700 hover:text-green-800 mb-6 text-lg font-medium"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back to Crop Selection
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Crop Selected
            </h2>
            <p className="text-gray-600 mb-6">
              Please go back and select a crop to view its growing plan.
            </p>
            <button
              onClick={onBack}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Select a Crop
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Generating Your Crop Plan
          </h2>
          <p className="text-gray-600">
            Creating a customized growing plan for {selectedCrop.name}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={onBack}
            className="flex items-center text-green-700 hover:text-green-800 mb-6 text-lg font-medium"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back to Crop Selection
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Unable to Load Crop Plan
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchCropPlan}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cropPlan) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-green-700 hover:text-green-800 mb-6 text-lg font-medium"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back to Crop Selection
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white p-3 rounded-full mr-4">
                {React.createElement(getCropIcon(selectedCrop.name), {
                  className: "w-10 h-10 text-green-600",
                })}
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {cropPlan.name} Growing Plan
                </h2>
                <div className="flex items-center justify-center text-green-100">
                  <span className="bg-green-500 bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium">
                    {cropPlan.crop_category}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-green-100 text-xl">
              Your complete guide to successful {cropPlan.name.toLowerCase()}{" "}
              cultivation
            </p>
          </div>

          <div className="p-8">
            {/* Key Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-blue-800 mb-2">
                  Best Planting
                </h3>
                <p className="text-blue-600 font-semibold text-sm">
                  {cropPlan.best_planting_months
                    .map((month) => getMonthName(month))
                    .join(", ")}
                </p>
                {cropPlan.recommended_planting_date && (
                  <p className="text-blue-500 text-xs mt-1">
                    Next: {cropPlan.recommended_planting_date}
                  </p>
                )}
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                <Clock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Duration
                </h3>
                <p className="text-green-600 font-semibold">
                  {formatDuration(cropPlan.duration_days)}
                </p>
                <p className="text-green-500 text-xs">
                  ({cropPlan.duration_days} days)
                </p>
              </div>

              <div className="bg-cyan-50 border-2 border-cyan-200 rounded-xl p-6 text-center">
                <Droplets className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-cyan-800 mb-2">
                  Water Need
                </h3>
                <p className="text-cyan-600 font-semibold text-sm">
                  {cropPlan.water_requirement}
                </p>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 text-center">
                <Thermometer className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-amber-800 mb-2">
                  Temperature
                </h3>
                <p className="text-amber-600 font-semibold text-sm">
                  {cropPlan.temperature_range}
                </p>
              </div>
            </div>

            {/* Additional Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Beaker className="w-6 h-6 text-purple-600 mr-2" />
                  <h3 className="text-lg font-bold text-purple-800">
                    Soil Requirements
                  </h3>
                </div>
                <p className="text-purple-600 font-semibold">
                  pH: {cropPlan.soil_ph_range}
                </p>
              </div>

              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <Leaf className="w-6 h-6 text-orange-600 mr-2" />
                  <h3 className="text-lg font-bold text-orange-800">
                    Fertilizer
                  </h3>
                </div>
                <p className="text-orange-600 font-semibold text-sm">
                  {cropPlan.fertilizer}
                </p>
              </div>
            </div>

            {/* Growing Stages */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Target className="w-8 h-8 mr-3 text-green-600" />
                Growing Stages Timeline
              </h3>

              <div className="space-y-4">
                {cropPlan.stages.map((stage, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-grow bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="text-xl font-bold text-gray-800">
                          {stage.stage}
                        </h4>
                        <span className="text-green-600 font-semibold text-sm bg-green-100 px-3 py-1 rounded-full">
                          {formatDuration(stage.duration_days)}
                        </span>
                      </div>
                      <p className="text-gray-600">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Tips */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                Expert Tips for {cropPlan.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {cropPlan.tips
                    .slice(0, Math.ceil(cropPlan.tips.length / 2))
                    .map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-green-600 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    ))}
                </div>
                <div className="space-y-2">
                  {cropPlan.tips
                    .slice(Math.ceil(cropPlan.tips.length / 2))
                    .map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <span className="text-green-600 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{tip}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Additional Tips Based on User Conditions */}
              {(cropPlan.soil_specific_tips ||
                cropPlan.weather_specific_tips ||
                cropPlan.scale_tips) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-bold text-gray-800 mb-3">
                    Customized Recommendations
                  </h4>

                  {cropPlan.soil_specific_tips && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        Soil-Specific Tips:
                      </h5>
                      <div className="space-y-1">
                        {cropPlan.soil_specific_tips.map((tip, index) => (
                          <div key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-1">→</span>
                            <span className="text-gray-600 text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cropPlan.weather_specific_tips && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <Sun className="w-4 h-4 mr-1" />
                        Weather-Specific Tips:
                      </h5>
                      <div className="space-y-1">
                        {cropPlan.weather_specific_tips.map((tip, index) => (
                          <div key={index} className="flex items-start">
                            <span className="text-orange-600 mr-2 mt-1">→</span>
                            <span className="text-gray-600 text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cropPlan.scale_tips && (
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2">
                        Farm Scale Tips:
                      </h5>
                      <div className="space-y-1">
                        {cropPlan.scale_tips.map((tip, index) => (
                          <div key={index} className="flex items-start">
                            <span className="text-purple-600 mr-2 mt-1">→</span>
                            <span className="text-gray-600 text-sm">{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={onNext}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                Start Growing {cropPlan.name}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropPlanPage;
