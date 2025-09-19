import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  MapPin,
  Layers,
  Calculator,
  Thermometer,
  CloudRain,
  Loader,
} from "lucide-react";
import type { FarmData } from "../App";

interface FarmDetailsPageProps {
  onNext: (data: FarmData) => void;
  onBack: () => void;
}

const FarmDetailsPage: React.FC<FarmDetailsPageProps> = ({
  onNext,
  onBack,
}) => {
  const [formData, setFormData] = useState<FarmData>({
    soilType: "",
    soilImage: null,
    location: "",
    farmSize: "",
    climate: "",
  });
  const [isLoadingWeather, setIsLoadingWeather] = useState<boolean>(false);
  const [weatherError, setWeatherError] = useState<string>("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const weatherDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Comprehensive soil types with descriptions
  const soilTypes = [
    {
      name: "Sandy",
      value: "sandy",
      description: "Well-draining, quick to warm up, low water retention",
      color: "bg-yellow-100 border-yellow-300",
    },
    {
      name: "Clay",
      value: "clay",
      description: "Heavy, nutrient-rich, slow drainage, retains water well",
      color: "bg-red-100 border-red-300",
    },
    {
      name: "Loamy",
      value: "loamy",
      description:
        "Ideal balance of sand, silt, and clay - excellent for crops",
      color: "bg-green-100 border-green-300",
    },
    {
      name: "Silty",
      value: "silty",
      description:
        "Fine particles, fertile, retains moisture, can be compacted",
      color: "bg-blue-100 border-blue-300",
    },
    {
      name: "Peaty",
      value: "peaty",
      description: "High organic matter, acidic, excellent water retention",
      color: "bg-purple-100 border-purple-300",
    },
    {
      name: "Chalky",
      value: "chalky",
      description: "Alkaline, stony, free-draining, may lack nutrients",
      color: "bg-gray-100 border-gray-300",
    },
    {
      name: "Saline",
      value: "saline",
      description: "High salt content, challenging for most crops",
      color: "bg-orange-100 border-orange-300",
    },
    {
      name: "Black Cotton",
      value: "black_cotton",
      description: "Rich in clay, swells when wet, cracks when dry",
      color: "bg-slate-100 border-slate-300",
    },
  ];

  // Popular agricultural locations for suggestions
  const popularLocations = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
    "Hyderabad",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Lucknow",
    "Nashik",
    "Solapur",
    "Aurangabad",
    "Nagpur",
    "Indore",
    "Bhopal",
    "Coimbatore",
    "Madurai",
    "Vijayawada",
    "Visakhapatnam",
    "Guntur",
    "Rajkot",
    "Surat",
    "Vadodara",
  ];

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleLocationChange = async (location: string) => {
    setFormData({ ...formData, location });

    // Show suggestions as user types
    if (location.trim().length > 0) {
      const filtered = popularLocations
        .filter((loc) => loc.toLowerCase().includes(location.toLowerCase()))
        .slice(0, 5);
      setLocationSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && location.length < 10);
    } else {
      setShowSuggestions(false);
    }

    // Wait for debounce before fetching weather to avoid rapid requests
    const debounceMs = 500;
    clearTimeout(weatherDebounceTimer.current);

    // Fetch weather data if location is long enough
    if (location.trim().length > 2) {
      setIsLoadingWeather(true);
      setWeatherError("");

      // Use a debounce to avoid too many requests while typing
      weatherDebounceTimer.current = setTimeout(async () => {
        console.log("Fetching weather data for location:", location.trim());

        try {
          const url = `http://localhost:5002/weather?location=${encodeURIComponent(
            location.trim()
          )}`;
          console.log("Calling weather API URL:", url);

          const response = await fetch(url);
          console.log("Weather API response status:", response.status);

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Weather API response data:", data);

          if (data.error) {
            console.error("Weather API returned error:", data.error);
            setWeatherError(data.error);
            setWeatherData(null);
          } else {
            console.log("Weather data successfully received");
            setWeatherData(data);
            setFormData((prev) => ({
              ...prev,
              climate: `${data.temperature}°C, ${data.humidity}% humidity`,
            }));
            setShowSuggestions(false); // Hide suggestions when successful
          }
        } catch (error) {
          console.error("Weather fetch error:", error);
          setWeatherError(
            "Failed to connect to weather service. Please check your internet connection and try again."
          );
        } finally {
          setIsLoadingWeather(false);
        }
      }, debounceMs);
    } else {
      // Clear weather data for short inputs
      setIsLoadingWeather(false);
      setWeatherData(null);
      setWeatherError("");
    }
  };

  const selectLocation = (location: string) => {
    handleLocationChange(location);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.soilType && formData.location && formData.farmSize) {
      onNext(formData);
    }
  };
  const climateTypes = [
    "Tropical",
    "Arid",
    "Temperate",
    "Continental",
    "Mediterranean",
    "Monsoon",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center text-green-700 hover:text-green-800 mb-6 text-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back to Sign In
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              Tell Us About Your Farm
            </h2>
            <p className="text-green-100 text-lg">
              Help us understand your farming conditions for personalized crop
              recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Soil Type Selection */}
              <div className="space-y-4">
                <label className="block text-xl font-semibold text-gray-800 mb-4">
                  <div className="flex items-center">
                    <Layers className="w-6 h-6 mr-2 text-green-600" />
                    Select Your Soil Type
                  </div>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {soilTypes.map((soil) => (
                    <div
                      key={soil.value}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                        formData.soilType === soil.value
                          ? `${soil.color} border-opacity-100 ring-2 ring-green-400`
                          : `${soil.color} border-opacity-50 hover:border-opacity-100`
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, soilType: soil.value })
                      }
                    >
                      <div className="flex items-center mb-2">
                        <input
                          type="radio"
                          name="soilType"
                          value={soil.value}
                          checked={formData.soilType === soil.value}
                          onChange={() =>
                            setFormData({ ...formData, soilType: soil.value })
                          }
                          className="w-5 h-5 text-green-600 mr-3"
                        />
                        <h3 className="font-semibold text-gray-800">
                          {soil.name} Soil
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-8">
                        {soil.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location Input */}
              <div className="space-y-4">
                <label className="block text-xl font-semibold text-gray-800">
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 mr-2 text-green-600" />
                    Farm Location
                  </div>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    onFocus={() =>
                      formData.location.length > 0 && setShowSuggestions(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    placeholder="Enter city name (e.g., Mumbai, Delhi, Bangalore)"
                    className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    required
                  />
                  {isLoadingWeather && (
                    <div className="absolute right-4 top-4">
                      <Loader className="w-6 h-6 text-green-600 animate-spin" />
                    </div>
                  )}

                  {/* Location Suggestions Dropdown */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectLocation(suggestion)}
                          className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-700 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {suggestion}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Popular Locations Quick Select */}
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Popular agricultural regions:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularLocations.slice(0, 8).map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => selectLocation(location)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
                {weatherError && (
                  <p className="text-red-600 text-sm">{weatherError}</p>
                )}
                {weatherData && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <CloudRain className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-800">
                        Current Weather Conditions
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Temperature:</span>
                        <div className="font-medium">
                          {weatherData.temperature}°C
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Humidity:</span>
                        <div className="font-medium">
                          {weatherData.humidity}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Rainfall:</span>
                        <div className="font-medium">
                          {weatherData.rainfall || 0}mm
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Conditions:</span>
                        <div className="font-medium capitalize">
                          {weatherData.description || "Clear"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Farm Size */}
              <div className="space-y-4">
                <label className="block text-xl font-semibold text-gray-800">
                  <div className="flex items-center">
                    <Calculator className="w-6 h-6 mr-2 text-green-600" />
                    Farm Size
                  </div>
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.farmSize}
                    onChange={(e) =>
                      setFormData({ ...formData, farmSize: e.target.value })
                    }
                    placeholder="Enter size"
                    className="flex-1 p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    required
                  />
                  <select
                    className="p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    defaultValue="acres"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                    <option value="bigha">Bigha</option>
                  </select>
                </div>
                <p className="text-gray-600">
                  Specify the total cultivable area of your farm
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={
                    !formData.soilType ||
                    !formData.location ||
                    !formData.farmSize
                  }
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-8 rounded-xl text-xl font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Crop Recommendations
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FarmDetailsPage;
