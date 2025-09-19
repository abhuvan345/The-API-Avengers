import React from "react";
import { ArrowLeft, Wheat, Leaf, Apple } from "lucide-react";

interface TestCropsPageProps {
  onCropSelect: (crop: any) => void;
  onBack: () => void;
}

const TestCropsPage: React.FC<TestCropsPageProps> = ({
  onCropSelect,
  onBack,
}) => {
  const testCrops = [
    {
      name: "Wheat",
      confidence: 85,
      expectedIncome: "₹50,000",
      rank: 1,
      icon: Wheat,
    },
    {
      name: "Rice",
      confidence: 78,
      expectedIncome: "₹45,000",
      rank: 2,
      icon: Leaf,
    },
    {
      name: "Maize",
      confidence: 72,
      expectedIncome: "₹40,000",
      rank: 3,
      icon: Leaf,
    },
  ];

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

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Test Crop Recommendations
          </h2>

          <div className="grid gap-6">
            {testCrops.map((crop, index) => (
              <div
                key={index}
                className="border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => onCropSelect(crop)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <crop.icon className="w-12 h-12 text-green-600 mr-4" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {crop.name}
                      </h3>
                      <p className="text-gray-600">
                        Confidence: {crop.confidence}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">
                      {crop.expectedIncome}
                    </p>
                    <p className="text-sm text-gray-500">Expected Income</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCropsPage;
