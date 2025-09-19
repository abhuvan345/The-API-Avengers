import React from "react";
import { Target } from "lucide-react";
import cropGrowingStages, { CropStage } from "../data/cropGrowingStages";

interface GrowingStagesTimelineProps {
  cropName: string;
}

const GrowingStagesTimeline: React.FC<GrowingStagesTimelineProps> = ({
  cropName,
}) => {
  const formatDuration = (days: number): string => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  // Get lowercase crop name for case-insensitive lookup
  const cropNameLower = cropName.toLowerCase();

  // Get the stages data for this crop, or return null if not found
  const cropData = cropGrowingStages[cropNameLower];

  if (!cropData) {
    return null; // Don't render anything if we don't have data for this crop
  }

  return (
    <div className="bg-gray-50 rounded-2xl p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <Target className="w-6 h-6 mr-2 text-green-600" />
        {cropName
          ? `${
              cropName.charAt(0).toUpperCase() + cropName.slice(1)
            } Growing Stages`
          : "Growing Stages Timeline"}
      </h3>

      <div className="space-y-4">
        {cropData.stages.map((stage: CropStage, index: number) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {index + 1}
              </div>
            </div>
            <div className="flex-grow bg-white rounded-xl p-3 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                <h4 className="text-md font-bold text-gray-800">
                  {stage.stage}
                </h4>
                <span className="text-green-600 font-semibold text-xs bg-green-100 px-2 py-1 rounded-full">
                  {formatDuration(stage.duration_days)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{stage.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GrowingStagesTimeline;
