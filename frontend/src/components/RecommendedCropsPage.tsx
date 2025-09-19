import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  DollarSign,
  Info,
  Wheat,
  Apple,
  Leaf,
  AlertCircle,
  CheckCircle,
  CloudRain,
  Loader,
  ThermometerSun,
} from "lucide-react";
import type { FarmData } from "../App";
import authService from "../services/authService";
import { useLanguage } from "../hooks/useLanguage";
import LanguageDropdown from "./LanguageDropdown";

interface CropSelectionData {
  name: string;
  confidence: number;
  expectedIncome: string;
  rank: number;
}

interface RecommendedCropsPageProps {
  farmData: FarmData;
  onCropSelect: (crop: CropSelectionData) => void;
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
    location: string;
    country: string;
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
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState<ApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<{
    type: "info" | "details";
    crop: Recommendation;
  } | null>(null);

  // Convert farm size string to numeric value
  const convertFarmSizeToNumeric = (farmSize: string): number => {
    const sizeMap: { [key: string]: number } = {
      "Small (1-5 acres)": 3,
      "Medium (5-20 acres)": 12,
      "Large (20+ acres)": 30,
    };
    return sizeMap[farmSize] || 5; // default to 5 acres if not found
  };

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Sending request with farmData:", farmData);

        const farmSizeNumeric = convertFarmSizeToNumeric(farmData.farmSize);

        const response = await fetch("http://localhost:5002/recommend", {
          method: "POST",
          headers: authService.getAuthHeaders(),
          body: JSON.stringify({
            soil_type: farmData.soilType,
            location: farmData.location,
            farm_size: farmSizeNumeric,
            climate: farmData.climate,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to get recommendations: ${response.status} - ${errorText}`
          );
        }

        const data = await response.json();
        console.log("Received recommendations:", data);
        setRecommendations(data);
      } catch (err) {
        console.error("Error fetching recommendations:", err);
        setError(
          err instanceof Error ? err.message : "Failed to get recommendations"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [farmData]);

  // Crop icons mapping
  const getCropIcon = (cropName: string) => {
    const icons: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      rice: Wheat,
      wheat: Wheat,
      maize: Wheat,
      chickpea: Leaf,
      kidneybeans: Leaf,
      pigeonpeas: Leaf,
      mothbeans: Leaf,
      mungbean: Leaf,
      blackgram: Leaf,
      lentil: Leaf,
      pomegranate: Apple,
      banana: Apple,
      mango: Apple,
      grapes: Apple,
      watermelon: Apple,
      muskmelon: Apple,
      apple: Apple,
      orange: Apple,
      papaya: Apple,
      coconut: Apple,
      cotton: Leaf,
      jute: Leaf,
      coffee: Leaf,
    };
    return icons[cropName.toLowerCase()] || Wheat;
  };

  // Get crop color based on confidence
  const getCropColor = (confidence: number, rank: number) => {
    if (rank === 1 && confidence > 85) return "border-green-500 bg-green-50";
    if (rank === 2 && confidence > 75) return "border-blue-500 bg-blue-50";
    if (rank === 3 && confidence > 65) return "border-orange-500 bg-orange-50";
    return "border-gray-400 bg-gray-50";
  };

  const handleCropClick = (crop: Recommendation) => {
    onCropSelect({
      name: crop.crop,
      confidence: crop.confidence,
      expectedIncome: `₹${crop.expected_income.toLocaleString()}`,
      rank: crop.rank,
    });
  };

  const openPopup = (type: "info" | "details", crop: Recommendation) => {
    setSelectedPopup({ type, crop });
  };

  const closePopup = () => {
    setSelectedPopup(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t("recommendations.analyzing")}
          </h2>
          <p className="text-gray-600">{t("recommendations.aiGenerating")}</p>
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
            Back to Farm Details
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("recommendations.unableToGetRecommendations")}
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              {t("recommendations.tryAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations || !recommendations.recommendations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={onBack}
            className="flex items-center text-green-700 hover:text-green-800 mb-6 text-lg font-medium"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            Back to Farm Details
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t("recommendations.noRecommendationsAvailable")}
            </h2>
            <p className="text-gray-600">
              {t("recommendations.unableToGenerateRecommendations")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button and Language Dropdown */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-green-700 hover:text-green-800 text-lg font-medium"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            {t("recommendations.backToFarmDetails")}
          </button>
          <LanguageDropdown />
        </div>

        {/* Header with Farm Analysis */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              {t("recommendations.aiCropRecommendations")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <CloudRain className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-green-100 text-sm">
                  {t("recommendations.weather")}
                </p>
                <p className="text-white font-bold">
                  {recommendations.weather_data?.description || "N/A"}
                </p>
                <p className="text-green-200 text-sm">
                  {recommendations.weather_data?.location}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <ThermometerSun className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-green-100 text-sm">
                  {t("recommendations.temperature")}
                </p>
                <p className="text-white font-bold">
                  {recommendations.weather_data?.temperature}°C
                </p>
                <p className="text-green-200 text-sm">
                  {t("recommendations.humidity")}:{" "}
                  {recommendations.weather_data?.humidity}%
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <Leaf className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-green-100 text-sm">
                  {t("recommendations.soilAnalysis")}
                </p>
                <p className="text-white font-bold">
                  {recommendations.soil_analysis?.type}
                </p>
                <p className="text-green-200 text-sm">
                  pH: {recommendations.soil_analysis?.pH}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {t("recommendations.topCropRecommendations")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.recommendations.map((crop, index) => {
                const IconComponent = getCropIcon(crop.crop);
                const colorClass = getCropColor(crop.confidence, crop.rank);

                return (
                  <div
                    key={index}
                    className={`${colorClass} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105`}
                    onClick={() => handleCropClick(crop)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-white p-3 rounded-full mr-3">
                          <IconComponent className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-800 capitalize">
                            {crop.crop}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {t("recommendations.rank")} #{crop.rank}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                          {crop.confidence.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {t("recommendations.confidence")}
                        </span>
                        <span className="text-sm font-semibold">
                          {crop.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${crop.confidence}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span className="font-semibold text-gray-800">
                          {t("recommendations.expectedIncome")}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        ₹{crop.expected_income.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openPopup("info", crop);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center text-sm"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        {t("recommendations.details")}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCropClick(crop);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-xl transition-colors flex items-center justify-center text-sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t("recommendations.select")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-600 text-lg">
                {t("recommendations.clickForPlan")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      {selectedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 capitalize">
                  {selectedPopup.crop.crop} - Details
                </h3>
                <button
                  onClick={closePopup}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Confidence Score
                    </h4>
                    <p className="text-2xl font-bold text-green-600">
                      {selectedPopup.crop.confidence.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Expected Income
                    </h4>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{selectedPopup.crop.expected_income.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Why This Crop?
                  </h4>
                  <p className="text-gray-600">
                    Based on your soil type (
                    {recommendations?.soil_analysis?.type}), current weather
                    conditions ({recommendations?.weather_data?.temperature}°C,{" "}
                    {recommendations?.weather_data?.humidity}% humidity), and
                    farm size ({farmData.farmSize}), this crop shows high
                    compatibility and profit potential.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Soil Nutrients
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Nitrogen</p>
                      <p className="font-bold">
                        {recommendations?.soil_analysis?.N}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Phosphorus</p>
                      <p className="font-bold">
                        {recommendations?.soil_analysis?.P}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Potassium</p>
                      <p className="font-bold">
                        {recommendations?.soil_analysis?.K}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    closePopup();
                    handleCropClick(selectedPopup.crop);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Select This Crop
                </button>
                <button
                  onClick={closePopup}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendedCropsPage;
