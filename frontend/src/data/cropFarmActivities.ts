// Farm Activity Calendar Data for commonly recommended crops
// This file stores month-by-month farming activities for popular crops

export interface MonthlyActivity {
  month: number;  // 1-12 representing Jan-Dec
  activities: string[];
  critical: boolean;
}

export interface CropFarmActivities {
  [key: string]: {
    activities: MonthlyActivity[];
    notes: string;
  };
}

const cropFarmActivities: CropFarmActivities = {
  // Rice farming activities
  "rice": {
    activities: [
      {
        month: 1,
        activities: [
          "Prepare seedbeds for summer rice in warmer regions",
          "Plan crop rotation for the year",
          "Maintain irrigation canals and water sources"
        ],
        critical: false
      },
      {
        month: 2,
        activities: [
          "Begin land preparation for summer crop",
          "Apply base fertilizer and organic matter",
          "Ensure farm equipment is in good condition"
        ],
        critical: false
      },
      {
        month: 3,
        activities: [
          "Complete seedbed preparation",
          "Sow seeds for summer crop",
          "Install bird deterrents around nursery"
        ],
        critical: true
      },
      {
        month: 4,
        activities: [
          "Transplant seedlings to main field",
          "Ensure proper water management",
          "Monitor for early pest infestations"
        ],
        critical: true
      },
      {
        month: 5,
        activities: [
          "Apply first top dressing of nitrogen",
          "Manage water level at 2-5cm",
          "Weed control measures"
        ],
        critical: true
      },
      {
        month: 6,
        activities: [
          "Apply second fertilizer application",
          "Monitor for diseases and pests",
          "Maintain appropriate water levels during tillering"
        ],
        critical: true
      },
      {
        month: 7,
        activities: [
          "Begin land preparation for monsoon crop",
          "Maintain water level for summer crop during flowering stage",
          "Prepare equipment for summer harvest"
        ],
        critical: true
      },
      {
        month: 8,
        activities: [
          "Harvest summer crop",
          "Post-harvest processing and drying",
          "Transplant monsoon crop seedlings"
        ],
        critical: true
      },
      {
        month: 9,
        activities: [
          "Fertilize monsoon crop",
          "Monitor water levels and pest management",
          "Prepare storage facilities for harvested summer crop"
        ],
        critical: true
      },
      {
        month: 10,
        activities: [
          "Maintain appropriate water level during flowering of monsoon crop",
          "Monitor for disease outbreaks",
          "Prepare for plant protection measures"
        ],
        critical: true
      },
      {
        month: 11,
        activities: [
          "Begin draining fields for monsoon crop harvest",
          "Plan for next crop cycle",
          "Maintain equipment for harvest"
        ],
        critical: true
      },
      {
        month: 12,
        activities: [
          "Harvest monsoon crop",
          "Post-harvest processing",
          "Begin soil preparation for next cycle"
        ],
        critical: true
      }
    ],
    notes: "Rice requires careful water management especially during critical growth stages. Water levels should be maintained at 2-5cm during the vegetative stage and 5-10cm during reproductive stages."
  },

  // Wheat farming activities
  "wheat": {
    activities: [
      {
        month: 1,
        activities: [
          "Apply second dose of nitrogen fertilizer",
          "Irrigation at crown root initiation stage",
          "Monitor for aphids and other pests"
        ],
        critical: true
      },
      {
        month: 2,
        activities: [
          "Irrigation during tillering stage",
          "Weed management",
          "Apply fungicides if needed for disease control"
        ],
        critical: true
      },
      {
        month: 3,
        activities: [
          "Irrigation during flowering and grain filling",
          "Monitor for rusts and other diseases",
          "Prepare harvesting equipment"
        ],
        critical: true
      },
      {
        month: 4,
        activities: [
          "Harvest when grain moisture reaches optimal level",
          "Post-harvest drying and cleaning",
          "Storage preparation"
        ],
        critical: true
      },
      {
        month: 5,
        activities: [
          "Sell or store harvested wheat",
          "Equipment maintenance",
          "Plan for next season crop rotation"
        ],
        critical: false
      },
      {
        month: 6,
        activities: [
          "Field rest period",
          "Soil testing",
          "Plan for soil improvement measures"
        ],
        critical: false
      },
      {
        month: 7,
        activities: [
          "Field rest period",
          "Green manuring or cover crops",
          "Canal and irrigation maintenance"
        ],
        critical: false
      },
      {
        month: 8,
        activities: [
          "Field rest period",
          "Prepare inputs for upcoming season",
          "Equipment repair and maintenance"
        ],
        critical: false
      },
      {
        month: 9,
        activities: [
          "Begin field preparation",
          "Apply base fertilizer and organic matter",
          "Plan seed procurement"
        ],
        critical: false
      },
      {
        month: 10,
        activities: [
          "Deep plowing and field leveling",
          "Apply pre-sowing irrigation",
          "Seed treatment"
        ],
        critical: true
      },
      {
        month: 11,
        activities: [
          "Sowing with proper spacing",
          "First irrigation after sowing",
          "Monitor for pests"
        ],
        critical: true
      },
      {
        month: 12,
        activities: [
          "First dose of nitrogen fertilizer",
          "Irrigation at crown root initiation",
          "Weed management"
        ],
        critical: true
      }
    ],
    notes: "Wheat requires careful moisture management. Irrigation at crown root initiation, tillering, flowering, and grain filling stages is critical. Control weeds early and watch for rusts and aphids."
  },

  // Maize farming activities
  "maize": {
    activities: [
      {
        month: 1,
        activities: [
          "Plan for spring maize cultivation",
          "Arrange for seeds and inputs",
          "Review previous season performance"
        ],
        critical: false
      },
      {
        month: 2,
        activities: [
          "Field preparation for spring maize",
          "Apply base fertilizer and organic matter",
          "Check irrigation systems"
        ],
        critical: true
      },
      {
        month: 3,
        activities: [
          "Sow spring maize seeds",
          "Apply starter fertilizer",
          "Install bird deterrents"
        ],
        critical: true
      },
      {
        month: 4,
        activities: [
          "Thinning of plants if needed",
          "First fertilizer top dressing",
          "Weed control"
        ],
        critical: true
      },
      {
        month: 5,
        activities: [
          "Second fertilizer application",
          "Regular irrigation",
          "Pest monitoring, especially stem borer"
        ],
        critical: true
      },
      {
        month: 6,
        activities: [
          "Irrigation during tasseling and silking",
          "Monitor for pests and diseases",
          "Prepare for monsoon season challenges"
        ],
        critical: true
      },
      {
        month: 7,
        activities: [
          "Field preparation for monsoon crop",
          "Harvest spring maize if mature",
          "Monitor drainage systems for monsoon"
        ],
        critical: true
      },
      {
        month: 8,
        activities: [
          "Sow monsoon maize",
          "Apply base fertilizer",
          "Ensure proper drainage"
        ],
        critical: true
      },
      {
        month: 9,
        activities: [
          "Weed control for monsoon crop",
          "First fertilizer top dressing",
          "Monitor for fall armyworm"
        ],
        critical: true
      },
      {
        month: 10,
        activities: [
          "Second fertilizer application for monsoon crop",
          "Monitor for cob formation",
          "Irrigation if rainfall insufficient"
        ],
        critical: true
      },
      {
        month: 11,
        activities: [
          "Prepare for monsoon crop harvest",
          "Monitor moisture levels in grain",
          "Equipment preparation"
        ],
        critical: true
      },
      {
        month: 12,
        activities: [
          "Harvest monsoon maize",
          "Post-harvest drying and processing",
          "Soil testing for next season"
        ],
        critical: true
      }
    ],
    notes: "Maize is sensitive to water stress, especially during tasseling and silking stages. Timely weed control is essential during the first 30-45 days. Watch for fall armyworm, which has become a major pest."
  },

  // Muskmelon farming activities
  "muskmelon": {
    activities: [
      {
        month: 1,
        activities: [
          "Select and prepare land for early spring planting",
          "Apply organic matter and base fertilizer",
          "Check irrigation systems"
        ],
        critical: true
      },
      {
        month: 2,
        activities: [
          "Prepare seedbeds or order seedlings",
          "Install plastic mulch and drip irrigation",
          "Prepare low tunnels or greenhouse for early planting"
        ],
        critical: true
      },
      {
        month: 3,
        activities: [
          "Plant seedlings or direct seed",
          "Install row covers if needed",
          "Monitor soil temperature and moisture"
        ],
        critical: true
      },
      {
        month: 4,
        activities: [
          "Regular irrigation",
          "Thin plants if needed",
          "Apply first fertilizer side dressing"
        ],
        critical: true
      },
      {
        month: 5,
        activities: [
          "Train vines if using vertical growing system",
          "Monitor for pests and diseases, especially downy mildew",
          "Install bee hives for pollination"
        ],
        critical: true
      },
      {
        month: 6,
        activities: [
          "Continue irrigation management",
          "Fruit thinning if needed for larger fruit size",
          "Monitor for fruit ripening"
        ],
        critical: true
      },
      {
        month: 7,
        activities: [
          "Harvest fruits as they ripen",
          "Careful handling to prevent damage",
          "Regular irrigation"
        ],
        critical: true
      },
      {
        month: 8,
        activities: [
          "Continue harvesting",
          "Monitor for late season pests",
          "Plan for post-harvest marketing"
        ],
        critical: true
      },
      {
        month: 9,
        activities: [
          "Late season care and harvesting",
          "Remove old plants after harvest",
          "Plan for next season"
        ],
        critical: false
      },
      {
        month: 10,
        activities: [
          "Field cleanup",
          "Soil testing",
          "Plan crop rotation"
        ],
        critical: false
      },
      {
        month: 11,
        activities: [
          "Equipment maintenance",
          "Procure inputs for next season",
          "Analyze market trends"
        ],
        critical: false
      },
      {
        month: 12,
        activities: [
          "Final planning for next season",
          "Secure contracts if appropriate",
          "Early land preparation for next cycle"
        ],
        critical: false
      }
    ],
    notes: "Muskmelon requires warm soil temperatures (above 18°C) for germination. Consistent irrigation is essential but avoid wetting foliage to prevent diseases. Bees are critical for proper pollination."
  },

  // Watermelon farming activities
  "watermelon": {
    activities: [
      {
        month: 1,
        activities: [
          "Plan watermelon production schedule",
          "Order seeds and inputs",
          "Analyze soil test results"
        ],
        critical: false
      },
      {
        month: 2,
        activities: [
          "Begin land preparation",
          "Apply organic matter and base fertilizer",
          "Install irrigation systems"
        ],
        critical: true
      },
      {
        month: 3,
        activities: [
          "Install plastic mulch and drip lines",
          "Prepare for transplanting or direct seeding",
          "Install low tunnels if needed for early planting"
        ],
        critical: true
      },
      {
        month: 4,
        activities: [
          "Transplant seedlings or direct seed",
          "Protect young plants from wind and cold",
          "Monitor for pests"
        ],
        critical: true
      },
      {
        month: 5,
        activities: [
          "Train vines if needed",
          "First fertilizer side dressing",
          "Monitor for flower development"
        ],
        critical: true
      },
      {
        month: 6,
        activities: [
          "Ensure pollination with adequate bee activity",
          "Manage irrigation carefully",
          "Monitor developing fruit"
        ],
        critical: true
      },
      {
        month: 7,
        activities: [
          "Place straw under developing fruits",
          "Monitor ripening process",
          "Begin early harvest"
        ],
        critical: true
      },
      {
        month: 8,
        activities: [
          "Peak harvesting period",
          "Careful handling to prevent damage",
          "Monitor for late season diseases"
        ],
        critical: true
      },
      {
        month: 9,
        activities: [
          "Final harvest",
          "Remove old plants",
          "Cover cropping"
        ],
        critical: true
      },
      {
        month: 10,
        activities: [
          "Soil testing",
          "Plan for crop rotation",
          "Equipment maintenance"
        ],
        critical: false
      },
      {
        month: 11,
        activities: [
          "Analyze season results",
          "Secure inputs for next season",
          "Review market trends"
        ],
        critical: false
      },
      {
        month: 12,
        activities: [
          "Final planning for next season",
          "Secure contracts if appropriate",
          "Early field preparations"
        ],
        critical: false
      }
    ],
    notes: "Watermelon needs consistent water supply but excess moisture can lead to diseases. Fruits are ready when the bottom spot turns yellowish, the skin loses its shine, and tapping produces a hollow sound."
  },

  // Mungbean farming activities
  "mungbean": {
    activities: [
      {
        month: 1,
        activities: [
          "Plan spring crop",
          "Arrange for seeds and inputs",
          "Review previous season performance"
        ],
        critical: false
      },
      {
        month: 2,
        activities: [
          "Field preparation for spring crop",
          "Apply organic matter",
          "Seed treatment with Rhizobium culture"
        ],
        critical: false
      },
      {
        month: 3,
        activities: [
          "Sowing spring crop",
          "Ensure proper seed depth and spacing",
          "Initial irrigation if soil is dry"
        ],
        critical: true
      },
      {
        month: 4,
        activities: [
          "Weed control measures",
          "Irrigation at critical stages",
          "Monitor for early pests"
        ],
        critical: true
      },
      {
        month: 5,
        activities: [
          "Monitor for flower development",
          "Watch for pest infestation",
          "Prepare for harvest"
        ],
        critical: true
      },
      {
        month: 6,
        activities: [
          "Harvest spring crop",
          "Post-harvest processing",
          "Prepare field for monsoon crop"
        ],
        critical: true
      },
      {
        month: 7,
        activities: [
          "Field preparation for monsoon crop",
          "Seed treatment",
          "Sowing monsoon crop"
        ],
        critical: true
      },
      {
        month: 8,
        activities: [
          "Weed management",
          "Monitor for pests, especially pod borer",
          "Ensure proper drainage"
        ],
        critical: true
      },
      {
        month: 9,
        activities: [
          "Monitor for diseases in humid conditions",
          "Watch for pod development",
          "Prepare for harvest"
        ],
        critical: true
      },
      {
        month: 10,
        activities: [
          "Harvest monsoon crop",
          "Post-harvest drying and processing",
          "Marketing or storage"
        ],
        critical: true
      },
      {
        month: 11,
        activities: [
          "Review season performance",
          "Soil testing",
          "Plan for next crop rotation"
        ],
        critical: false
      },
      {
        month: 12,
        activities: [
          "Equipment maintenance",
          "Secure inputs for next season",
          "Knowledge building"
        ],
        critical: false
      }
    ],
    notes: "Mungbean is a short-duration crop that fits well into crop rotations. It can be grown as a catch crop between major cereal crops. Being a legume, it helps improve soil fertility."
  }
};

export default cropFarmActivities;