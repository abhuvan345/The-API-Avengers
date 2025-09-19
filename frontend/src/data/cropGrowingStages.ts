// Crop Growing Stages Data for commonly recommended crops
// This file stores growing stages timeline data for the most recommended crops

export interface CropStage {
  stage: string;
  duration_days: number;
  description: string;
}

export interface CropGrowingStages {
  [key: string]: {
    stages: CropStage[];
  };
}

const cropGrowingStages: CropGrowingStages = {
  // Rice growing stages
  "rice": {
    stages: [
      {
        stage: "Germination",
        duration_days: 7,
        description: "Seeds begin sprouting in moist conditions. Keep soil consistently wet."
      },
      {
        stage: "Seedling",
        duration_days: 21,
        description: "Young plants develop roots and first leaves. Maintain water levels at 2-5cm depth."
      },
      {
        stage: "Tillering",
        duration_days: 30,
        description: "Multiple stems grow from the main plant. This is when nitrogen fertilizer is most beneficial."
      },
      {
        stage: "Stem Elongation",
        duration_days: 20,
        description: "Plants grow taller and develop stronger stems. Maintain consistent water levels."
      },
      {
        stage: "Panicle Initiation",
        duration_days: 30,
        description: "Flower heads begin to form inside the stem. Crucial stage for water management."
      },
      {
        stage: "Heading & Flowering",
        duration_days: 15,
        description: "Panicles emerge and flowering occurs. Do not drain field during this critical period."
      },
      {
        stage: "Grain Filling",
        duration_days: 30,
        description: "Grains develop and mature, changing from green to gold. Maintain consistent moisture."
      },
      {
        stage: "Maturity & Harvesting",
        duration_days: 15,
        description: "Rice is ready for harvest when 80-85% of grains turn golden yellow. Drain fields before harvesting."
      }
    ]
  },
  
  // Wheat growing stages
  "wheat": {
    stages: [
      {
        stage: "Germination",
        duration_days: 7,
        description: "Seeds sprout and develop first roots. Ensure soil has adequate moisture but not waterlogged."
      },
      {
        stage: "Seedling",
        duration_days: 15,
        description: "First leaves emerge and begin photosynthesis. Monitor for early pests and diseases."
      },
      {
        stage: "Tillering",
        duration_days: 30,
        description: "Multiple stems form from the base of the plant. Apply nitrogen fertilizer at this stage."
      },
      {
        stage: "Stem Extension",
        duration_days: 20,
        description: "Plants grow taller rapidly. Ensure adequate nutrients and water during this growth spurt."
      },
      {
        stage: "Booting",
        duration_days: 10,
        description: "Developing head can be felt within the uppermost leaf sheath. Protect from water stress."
      },
      {
        stage: "Heading",
        duration_days: 10,
        description: "Seed heads emerge from leaf sheath. Critical stage for irrigation and disease prevention."
      },
      {
        stage: "Flowering",
        duration_days: 8,
        description: "Pollination occurs. Avoid stressful conditions like extreme heat or water shortage."
      },
      {
        stage: "Grain Development",
        duration_days: 30,
        description: "Grains fill with starch. Ensure adequate moisture and nutrients for optimal grain size."
      },
      {
        stage: "Ripening",
        duration_days: 15,
        description: "Grains harden and plants turn golden. Prepare for harvesting as moisture content drops."
      }
    ]
  },
  
  // Maize growing stages
  "maize": {
    stages: [
      {
        stage: "Germination",
        duration_days: 10,
        description: "Seeds absorb water and begin sprouting. Soil temperature should be at least 10°C."
      },
      {
        stage: "Seedling",
        duration_days: 20,
        description: "Young plants establish roots and develop first true leaves. Protect from pests and cold."
      },
      {
        stage: "Vegetative Growth",
        duration_days: 35,
        description: "Rapid stem and leaf development. Apply nitrogen fertilizer to support growth."
      },
      {
        stage: "Tasseling",
        duration_days: 10,
        description: "Male flowers (tassels) emerge at the top of the plant. Ensure adequate water supply."
      },
      {
        stage: "Silking",
        duration_days: 10,
        description: "Female flowers (silks) emerge from ear tips. Critical stage for pollination and yield."
      },
      {
        stage: "Blister & Milk",
        duration_days: 20,
        description: "Kernels develop and fill with a milky fluid. Maintain consistent water supply."
      },
      {
        stage: "Dough & Dent",
        duration_days: 25,
        description: "Kernels solidify as starch accumulates. Dent forms on kernel surface as it matures."
      },
      {
        stage: "Physiological Maturity",
        duration_days: 10,
        description: "Black layer forms at base of kernels. Plants begin drying, ready for harvest when kernel moisture reaches appropriate level."
      }
    ]
  },
  
  // Muskmelon growing stages
  "muskmelon": {
    stages: [
      {
        stage: "Germination",
        duration_days: 8,
        description: "Seeds sprout in warm soil (at least 20°C). Keep soil moist but not soggy."
      },
      {
        stage: "Early Growth",
        duration_days: 21,
        description: "Young plants develop first true leaves. Protect from cool temperatures and strong winds."
      },
      {
        stage: "Vine Development",
        duration_days: 21,
        description: "Vines elongate rapidly. Consider training vines for better space utilization."
      },
      {
        stage: "Flowering",
        duration_days: 10,
        description: "Male and female flowers appear on the vines. Bees or other pollinators are essential."
      },
      {
        stage: "Fruit Set",
        duration_days: 10,
        description: "Small fruits begin developing. Thin to 2-3 fruits per vine for larger melons."
      },
      {
        stage: "Fruit Growth",
        duration_days: 25,
        description: "Fruits grow larger. Apply consistent water to prevent splitting; avoid wetting foliage."
      },
      {
        stage: "Ripening",
        duration_days: 15,
        description: "Fruits develop netting pattern and aroma. Reduce watering slightly to enhance sweetness."
      },
      {
        stage: "Harvest",
        duration_days: 5,
        description: "Fruits are ready when skin netting is prominent, stem begins to crack, and fruits have a sweet aroma."
      }
    ]
  },
  
  // Watermelon growing stages
  "watermelon": {
    stages: [
      {
        stage: "Germination",
        duration_days: 7,
        description: "Seeds sprout in warm soil (at least 21°C). Maintain consistent moisture."
      },
      {
        stage: "Seedling",
        duration_days: 14,
        description: "Young plants develop first true leaves. Protect from frost and cold temperatures."
      },
      {
        stage: "Vine Growth",
        duration_days: 25,
        description: "Vines spread vigorously. Consider providing support or directing growth pattern."
      },
      {
        stage: "Flowering",
        duration_days: 10,
        description: "Male and female flowers bloom on the vines. Ensure pollinators can access flowers."
      },
      {
        stage: "Fruit Set",
        duration_days: 10,
        description: "Small fruits begin developing after pollination. Thin to 2-3 fruits per plant for larger melons."
      },
      {
        stage: "Fruit Development",
        duration_days: 30,
        description: "Fruits grow rapidly. Provide consistent water and place cardboard under fruit to prevent soil contact."
      },
      {
        stage: "Ripening",
        duration_days: 14,
        description: "Fruits reach mature size and begin ripening. Reduce watering to enhance sweetness."
      },
      {
        stage: "Harvest",
        duration_days: 5,
        description: "Ready when underside turns yellowish, skin becomes dull, and tapping produces a hollow sound."
      }
    ]
  },
  
  // Mungbean growing stages
  "mungbean": {
    stages: [
      {
        stage: "Germination",
        duration_days: 5,
        description: "Seeds sprout quickly in warm soil. Ensure adequate soil moisture but avoid waterlogging."
      },
      {
        stage: "Seedling",
        duration_days: 10,
        description: "Young plants establish root system and first true leaves. Monitor for early pests."
      },
      {
        stage: "Vegetative Growth",
        duration_days: 20,
        description: "Plants develop branches and leaves rapidly. Apply balanced fertilizer if needed."
      },
      {
        stage: "Flowering",
        duration_days: 10,
        description: "Yellow flowers bloom in clusters. Ensure adequate water to prevent flower drop."
      },
      {
        stage: "Pod Formation",
        duration_days: 10,
        description: "Small pods begin developing after successful pollination. Critical water stage."
      },
      {
        stage: "Pod Development",
        duration_days: 15,
        description: "Pods elongate and seeds develop inside. Maintain consistent moisture."
      },
      {
        stage: "Pod Maturation",
        duration_days: 10,
        description: "Pods begin to change color from green to black/brown. Plants start yellowing."
      },
      {
        stage: "Harvest",
        duration_days: 5,
        description: "Ready when 80-90% of pods turn black or brown. Harvest before pods shatter to prevent seed loss."
      }
    ]
  }
};

export default cropGrowingStages;