import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  DollarSign,
  Info,
  Wheat,
  Apple,
  Carrot,
  Leaf,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { FarmData } from "../App";

interface RecommendedCropsPageProps {
  farmData: FarmData;
  onCropSelect: (crop: any) => void;
  onBack: () => void;
}

interface Recommendation {
  crop: string;
  confidence: number;
  expected_income: number;
  rank: number;
}

interface ApiResponse {
  recommendations: Recommendation[];
  weather_data: {
    temperature: number;
    humidity: number;
    rainfall: number;
    description: string;
  };
  soil_analysis: {
    type: string;
    N: number;
    P: number;
    K: number;
    pH: number;
  };
  farm_size: string;
  location: string;
}

const RecommendedCropsPage: React.FC<RecommendedCropsPageProps> = ({
  farmData,
  onCropSelect,
  onBack,
}) => {
  const [recommendations, setRecommendations] = useState<ApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<{
    type: "budget" | "reason";
    crop: any;
  } | null>(null);

  // Crop icons mapping
  const cropIcons: { [key: string]: any } = {
    wheat: Wheat,
    rice: Wheat,
    maize: Wheat,
    tomato: Apple,
    tomatoes: Apple,
    apple: Apple,
    orange: Apple,
    mango: Apple,
    grapes: Apple,
    banana: Apple,
    carrot: Carrot,
    carrots: Carrot,
    potato: Carrot,
    onion: Carrot,
    spinach: Leaf,
    cabbage: Leaf,
    lettuce: Leaf,
    default: Wheat,
  };

  // Crop colors mapping
  const cropColors: { [key: string]: string } = {
    wheat: "border-amber-400 bg-amber-50",
    rice: "border-green-400 bg-green-50",
    maize: "border-yellow-400 bg-yellow-50",
    cotton: "border-blue-400 bg-blue-50",
    tomatoes: "border-red-400 bg-red-50",
    apple: "border-red-400 bg-red-50",
    orange: "border-orange-400 bg-orange-50",
    mango: "border-yellow-400 bg-yellow-50",
    grapes: "border-purple-400 bg-purple-50",
    banana: "border-yellow-400 bg-yellow-50",
    coconut: "border-brown-400 bg-brown-50",
    coffee: "border-brown-400 bg-brown-50",
    default: "border-green-400 bg-green-50",
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5002/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          soil_type: farmData.soilType,
          location: farmData.location,
          farm_size: parseFloat(farmData.farmSize),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recommendations");
      }

      const data: ApiResponse = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load recommendations"
      );
    } finally {
      setLoading(false);
    }
  };

  const getCropIcon = (cropName: string) => {
    const IconComponent =
      cropIcons[cropName.toLowerCase()] || cropIcons["default"];
    return IconComponent;
  };

  const getCropColor = (cropName: string) => {
    return cropColors[cropName.toLowerCase()] || cropColors["default"];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High Confidence";
    if (confidence >= 60) return "Medium Confidence";
    return "Low Confidence";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Analyzing Your Farm Data...
          </h2>
          <p className="text-gray-600 mt-2">
            Getting personalized crop recommendations
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Error Loading Recommendations
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onBack}
            className="ml-4 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-green-700 hover:text-green-800 mb-6 text-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back to Farm Details
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              🌾 Your Personalized Crop Recommendations
            </h2>
            <p className="text-green-100 text-lg">
              Based on your soil type, location, and current weather conditions
            </p>
          </div>

          {/* Farm Analysis Summary */}
          {recommendations && (
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700">Location</h3>
                  <p className="text-lg font-bold text-green-600">
                    {recommendations.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    {recommendations.weather_data.description}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700">Soil Type</h3>
                  <p className="text-lg font-bold text-green-600 capitalize">
                    {recommendations.soil_analysis.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    pH: {recommendations.soil_analysis.pH}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700">Farm Size</h3>
                  <p className="text-lg font-bold text-green-600">
                    {recommendations.farm_size} acres
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-gray-700">Weather</h3>
                  <p className="text-lg font-bold text-green-600">
                    {recommendations.weather_data.temperature}°C
                  </p>
                  <p className="text-sm text-gray-600">
                    {recommendations.weather_data.humidity}% humidity
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.recommendations.map((rec, index) => {
              const IconComponent = getCropIcon(rec.crop);
              const cropColor = getCropColor(rec.crop);

              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${cropColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <IconComponent className="w-8 h-8 text-green-600 mr-3" />
                        <h3 className="text-2xl font-bold text-gray-800 capitalize">
                          {rec.crop}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                          #{rec.rank}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Confidence:</span>
                        <span
                          className={`font-semibold ${getConfidenceColor(
                            rec.confidence
                          )}`}
                        >
                          {rec.confidence}% -{" "}
                          {getConfidenceLabel(rec.confidence)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Expected Income:</span>
                        <span className="font-bold text-green-600 text-lg">
                          {formatCurrency(rec.expected_income)}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <button
                          onClick={() => onCropSelect(rec)}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Select This Crop
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Info className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-semibold text-gray-800">
              How We Calculate Recommendations
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                🌱 Soil Analysis
              </h4>
              <p>
                We analyze your soil type's nutrient profile (N-P-K) and pH
                levels to match crops that thrive in your conditions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                🌤️ Weather Integration
              </h4>
              <p>
                Real-time weather data including temperature, humidity, and
                rainfall patterns inform our recommendations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                💰 Income Estimation
              </h4>
              <p>
                Expected income calculations consider market prices, typical
                yields, and production costs for your region.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedCropsPage;
