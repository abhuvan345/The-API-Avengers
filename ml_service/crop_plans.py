import datetime
from typing import Dict, List, Any
import calendar

# Comprehensive crop growing database for all 22 supported crops
CROP_GROWING_DATABASE = {
    "rice": {
        "name": "Rice",
        "duration_days": 120,
        "best_planting_months": [5, 6, 7],  # May-July for Kharif
        "water_requirement": "High - Flooded fields required",
        "fertilizer": "NPK 120:60:40 kg/ha. Apply Urea in splits",
        "soil_ph_range": "5.5-7.0",
        "temperature_range": "22-32°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 7, "description": "Puddling and leveling fields for water retention"},
            {"stage": "Sowing/Transplanting", "duration_days": 14, "description": "Direct seeding or transplanting 20-25 day old seedlings"},
            {"stage": "Tillering", "duration_days": 35, "description": "Plant develops multiple shoots, maintain 2-5cm water level"},
            {"stage": "Panicle Initiation", "duration_days": 10, "description": "Reproductive phase begins, increase water level to 5-10cm"},
            {"stage": "Flowering", "duration_days": 14, "description": "Panicles emerge and flower, critical water management period"},
            {"stage": "Grain Filling", "duration_days": 30, "description": "Grains develop and mature, maintain moisture"},
            {"stage": "Harvesting", "duration_days": 10, "description": "Harvest when 80% grains are golden yellow"}
        ],
        "tips": [
            "Maintain 2-5cm standing water during vegetative growth",
            "Apply split doses of nitrogen for better yield",
            "Control weeds early to prevent competition",
            "Monitor for blast, brown spot, and bacterial blight diseases",
            "Harvest at proper moisture content (20-25%) for better milling quality"
        ]
    },
    "wheat": {
        "name": "Wheat",
        "duration_days": 120,
        "best_planting_months": [11, 12],  # November-December for Rabi
        "water_requirement": "Moderate - 4-5 irrigations required",
        "fertilizer": "NPK 120:60:40 kg/ha. Apply full P&K at sowing, N in splits",
        "soil_ph_range": "6.0-7.5",
        "temperature_range": "15-25°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 7, "description": "Deep plowing and field preparation for optimal seed bed"},
            {"stage": "Sowing", "duration_days": 7, "description": "Timely sowing with proper seed rate and depth"},
            {"stage": "Germination", "duration_days": 10, "description": "Seeds emerge, ensure adequate moisture"},
            {"stage": "Tillering", "duration_days": 45, "description": "Plant develops multiple shoots, first irrigation at 20-25 DAS"},
            {"stage": "Jointing", "duration_days": 15, "description": "Stem elongation begins, second irrigation critical"},
            {"stage": "Flowering", "duration_days": 15, "description": "Ear emergence and anthesis, third irrigation needed"},
            {"stage": "Grain Filling", "duration_days": 30, "description": "Grain development and maturation, fourth irrigation"},
            {"stage": "Harvesting", "duration_days": 7, "description": "Harvest when grains are hard and moisture is 12-14%"}
        ],
        "tips": [
            "Sow at proper time to avoid heat stress during grain filling",
            "Apply first irrigation 20-25 days after sowing",
            "Use balanced fertilization for optimal yield",
            "Control weeds at 30-35 days after sowing",
            "Monitor for rust diseases and treat promptly"
        ]
    },
    "maize": {
        "name": "Maize",
        "duration_days": 90,
        "best_planting_months": [6, 7, 11, 12],  # Kharif and Rabi seasons
        "water_requirement": "Moderate - 500-800mm total water requirement",
        "fertilizer": "NPK 120:60:40 kg/ha. Apply 25% N at sowing, remaining in splits",
        "soil_ph_range": "5.8-8.0",
        "temperature_range": "21-27°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 5, "description": "Deep plowing and creating ridges for proper drainage"},
            {"stage": "Sowing", "duration_days": 3, "description": "Plant seeds at 4-5cm depth with proper spacing"},
            {"stage": "Germination", "duration_days": 7, "description": "Seeds emerge in 5-7 days under favorable conditions"},
            {"stage": "Vegetative Growth", "duration_days": 35, "description": "Rapid growth phase, ensure adequate nutrition and water"},
            {"stage": "Tasseling", "duration_days": 10, "description": "Male flowers appear, critical water requirement period"},
            {"stage": "Silking", "duration_days": 10, "description": "Female flowers emerge, pollination occurs"},
            {"stage": "Grain Filling", "duration_days": 25, "description": "Kernels develop and mature"},
            {"stage": "Harvesting", "duration_days": 5, "description": "Harvest when moisture content is 15-20%"}
        ],
        "tips": [
            "Ensure proper plant population of 60,000-75,000 plants/ha",
            "Apply adequate phosphorus for root development",
            "Maintain soil moisture during tasseling and silking",
            "Control stem borer and fall armyworm effectively",
            "Harvest at physiological maturity for maximum yield"
        ]
    },
    "chickpea": {
        "name": "Chickpea",
        "duration_days": 95,
        "best_planting_months": [10, 11],  # October-November
        "water_requirement": "Low - 2-3 irrigations sufficient",
        "fertilizer": "NPK 20:40:20 kg/ha. Apply full dose at sowing",
        "soil_ph_range": "6.0-7.5",
        "temperature_range": "25-35°C (day), 15-20°C (night)",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 5, "description": "Medium deep plowing and field leveling"},
            {"stage": "Sowing", "duration_days": 3, "description": "Seed treatment and sowing at 3-4cm depth"},
            {"stage": "Germination", "duration_days": 8, "description": "Seeds emerge in 7-10 days"},
            {"stage": "Vegetative Growth", "duration_days": 35, "description": "Branch development and leaf formation"},
            {"stage": "Flowering", "duration_days": 25, "description": "Flower initiation and development"},
            {"stage": "Pod Formation", "duration_days": 15, "description": "Pod setting and early development"},
            {"stage": "Pod Filling", "duration_days": 20, "description": "Seed development within pods"},
            {"stage": "Maturity", "duration_days": 10, "description": "Pods turn brown and seeds mature"}
        ],
        "tips": [
            "Use rhizobium-treated seeds for nitrogen fixation",
            "Avoid excessive irrigation to prevent root rot",
            "Apply first irrigation at pre-flowering stage",
            "Control pod borer using integrated pest management",
            "Harvest when pods are fully dry and rattle"
        ]
    },
    "kidneybeans": {
        "name": "Kidney Beans",
        "duration_days": 90,
        "best_planting_months": [6, 7, 10, 11],  # Kharif and Rabi
        "water_requirement": "Moderate - 350-400mm water requirement",
        "fertilizer": "NPK 25:50:25 kg/ha. Apply full P&K, 25% N at sowing",
        "soil_ph_range": "6.0-7.0",
        "temperature_range": "20-25°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 5, "description": "Prepare fine seedbed with good drainage"},
            {"stage": "Sowing", "duration_days": 3, "description": "Sow treated seeds at 3-4cm depth"},
            {"stage": "Germination", "duration_days": 7, "description": "Emergence occurs in 6-8 days"},
            {"stage": "Vegetative Growth", "duration_days": 30, "description": "Trifoliate leaf development and branching"},
            {"stage": "Flowering", "duration_days": 15, "description": "Flower clusters appear and bloom"},
            {"stage": "Pod Development", "duration_days": 20, "description": "Pods form and elongate"},
            {"stage": "Pod Filling", "duration_days": 15, "description": "Seeds develop and mature in pods"},
            {"stage": "Harvesting", "duration_days": 5, "description": "Harvest when pods are dry but not shattered"}
        ],
        "tips": [
            "Inoculate seeds with rhizobium for better nodulation",
            "Provide support for climbing varieties",
            "Maintain soil moisture during flowering and pod filling",
            "Control anthracnose and bacterial blight diseases",
            "Harvest frequently to encourage continued production"
        ]
    },
    "pigeonpeas": {
        "name": "Pigeon Peas",
        "duration_days": 150,
        "best_planting_months": [6, 7],  # June-July for Kharif
        "water_requirement": "Low - Drought tolerant, 2-3 irrigations",
        "fertilizer": "NPK 25:50:25 kg/ha. Apply full dose at sowing",
        "soil_ph_range": "5.5-8.4",
        "temperature_range": "20-40°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 7, "description": "Deep plowing for tap root development"},
            {"stage": "Sowing", "duration_days": 5, "description": "Sow at 2-3cm depth with wide row spacing"},
            {"stage": "Germination", "duration_days": 10, "description": "Seeds emerge slowly in 8-12 days"},
            {"stage": "Vegetative Growth", "duration_days": 60, "description": "Extensive root and shoot development"},
            {"stage": "Flowering", "duration_days": 30, "description": "Multiple flushes of flowering"},
            {"stage": "Pod Formation", "duration_days": 20, "description": "Pod setting and early development"},
            {"stage": "Pod Filling", "duration_days": 25, "description": "Seed development and maturation"},
            {"stage": "Harvesting", "duration_days": 15, "description": "Multiple harvests as pods mature"}
        ],
        "tips": [
            "Use long-duration varieties for better yield",
            "Intercrop with cereals for better land utilization",
            "Minimal irrigation required due to deep root system",
            "Control pod fly and pod wasp using IPM practices",
            "Harvest pods at proper maturity to prevent shattering"
        ]
    },
    "mothbeans": {
        "name": "Moth Beans",
        "duration_days": 75,
        "best_planting_months": [7, 8],  # July-August
        "water_requirement": "Very Low - Extremely drought tolerant",
        "fertilizer": "NPK 15:30:15 kg/ha. Minimal fertilizer requirement",
        "soil_ph_range": "7.0-8.5",
        "temperature_range": "25-35°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 3, "description": "Light tillage, suitable for marginal lands"},
            {"stage": "Sowing", "duration_days": 2, "description": "Broadcast or line sowing at shallow depth"},
            {"stage": "Germination", "duration_days": 5, "description": "Quick emergence in 4-6 days"},
            {"stage": "Vegetative Growth", "duration_days": 25, "description": "Prostrate growth habit, drought adaptation"},
            {"stage": "Flowering", "duration_days": 15, "description": "Small yellow flowers appear"},
            {"stage": "Pod Formation", "duration_days": 15, "description": "Small pods develop close to ground"},
            {"stage": "Pod Filling", "duration_days": 10, "description": "Seeds mature quickly"},
            {"stage": "Harvesting", "duration_days": 5, "description": "Harvest entire plant when pods are dry"}
        ],
        "tips": [
            "Excellent crop for arid and semi-arid regions",
            "Requires minimal inputs and care",
            "Can be grown on poor fertility soils",
            "Natural pest resistance due to hairy leaves",
            "Harvest carefully as pods are small and close to ground"
        ]
    },
    "mungbean": {
        "name": "Mung Bean",
        "duration_days": 65,
        "best_planting_months": [3, 4, 7, 8],  # Summer and Kharif
        "water_requirement": "Low-Moderate - 300-400mm total requirement",
        "fertilizer": "NPK 25:50:25 kg/ha. Apply full dose at sowing",
        "soil_ph_range": "6.2-7.2",
        "temperature_range": "25-35°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 3, "description": "Fine seedbed preparation with good drainage"},
            {"stage": "Sowing", "duration_days": 2, "description": "Sow at 2-3cm depth with proper spacing"},
            {"stage": "Germination", "duration_days": 5, "description": "Quick emergence in 4-6 days"},
            {"stage": "Vegetative Growth", "duration_days": 25, "description": "Trifoliate leaf development"},
            {"stage": "Flowering", "duration_days": 15, "description": "Yellow flowers in clusters"},
            {"stage": "Pod Development", "duration_days": 10, "description": "Pods form and elongate rapidly"},
            {"stage": "Pod Filling", "duration_days": 10, "description": "Seeds develop and mature"},
            {"stage": "Harvesting", "duration_days": 3, "description": "Harvest in 2-3 pickings"}
        ],
        "tips": [
            "Quick maturing crop, suitable for multiple cropping",
            "Inoculate seeds with rhizobium for better nitrogen fixation",
            "Harvest pods when they turn brown but before shattering",
            "Control yellow mosaic virus through resistant varieties",
            "Market fresh green pods for higher income"
        ]
    },
    "blackgram": {
        "name": "Black Gram",
        "duration_days": 75,
        "best_planting_months": [6, 7, 10, 11],  # Kharif and Rabi
        "water_requirement": "Low - 2-3 irrigations sufficient",
        "fertilizer": "NPK 25:50:25 kg/ha. Apply full P&K at sowing",
        "soil_ph_range": "6.5-7.5",
        "temperature_range": "25-35°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 4, "description": "Medium deep plowing and field leveling"},
            {"stage": "Sowing", "duration_days": 3, "description": "Line sowing at 2-3cm depth"},
            {"stage": "Germination", "duration_days": 6, "description": "Emergence in 5-7 days"},
            {"stage": "Vegetative Growth", "duration_days": 28, "description": "Branching and leaf development"},
            {"stage": "Flowering", "duration_days": 15, "description": "Yellow flowers appear in clusters"},
            {"stage": "Pod Formation", "duration_days": 12, "description": "Pod setting and early development"},
            {"stage": "Pod Filling", "duration_days": 12, "description": "Seed development in pods"},
            {"stage": "Harvesting", "duration_days": 5, "description": "Harvest when pods turn black"}
        ],
        "tips": [
            "Grow after rice in rice-wheat system for soil improvement",
            "Use certified seeds for better germination",
            "Control yellow mosaic virus and leaf curl diseases",
            "Harvest at proper maturity to prevent shattering",
            "Store properly to prevent storage pest damage"
        ]
    },
    "lentil": {
        "name": "Lentil",
        "duration_days": 110,
        "best_planting_months": [10, 11],  # October-November
        "water_requirement": "Low - 1-2 irrigations required",
        "fertilizer": "NPK 20:40:20 kg/ha. Apply full dose at sowing",
        "soil_ph_range": "6.0-7.5",
        "temperature_range": "18-30°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 5, "description": "Fine seedbed with good drainage"},
            {"stage": "Sowing", "duration_days": 3, "description": "Line sowing at 2-3cm depth"},
            {"stage": "Germination", "duration_days": 8, "description": "Emergence in 7-10 days"},
            {"stage": "Vegetative Growth", "duration_days": 40, "description": "Branching and compound leaf development"},
            {"stage": "Flowering", "duration_days": 25, "description": "Small white or purple flowers"},
            {"stage": "Pod Formation", "duration_days": 15, "description": "Flat pods develop"},
            {"stage": "Pod Filling", "duration_days": 18, "description": "1-2 seeds develop per pod"},
            {"stage": "Harvesting", "duration_days": 6, "description": "Harvest when pods are dry"}
        ],
        "tips": [
            "Cold-tolerant crop, can withstand light frost",
            "Requires well-drained soil to prevent root rot",
            "Apply irrigation at flowering stage if needed",
            "Control aphids and pod borer using IPM",
            "Harvest early morning to prevent shattering"
        ]
    },
    "pomegranate": {
        "name": "Pomegranate",
        "duration_days": 1095,  # 3 years to establish, then annual cycles
        "best_planting_months": [2, 3, 7, 8],  # February-March, July-August
        "water_requirement": "Moderate - Drip irrigation recommended",
        "fertilizer": "NPK 500:250:500 g/plant/year in splits",
        "soil_ph_range": "5.5-7.5",
        "temperature_range": "15-35°C",
        "stages": [
            {"stage": "Plantation", "duration_days": 30, "description": "Plant grafted saplings with proper spacing"},
            {"stage": "Establishment", "duration_days": 365, "description": "Root establishment and initial growth"},
            {"stage": "Vegetative Growth", "duration_days": 730, "description": "Canopy development and training"},
            {"stage": "Flowering", "duration_days": 60, "description": "First flowering usually in 2nd year"},
            {"stage": "Fruit Development", "duration_days": 150, "description": "Fruit setting and growth"},
            {"stage": "Maturation", "duration_days": 30, "description": "Fruit ripening and harvest"},
            {"stage": "Post Harvest", "duration_days": 60, "description": "Pruning and dormancy period"}
        ],
        "tips": [
            "Requires 3-4 years to come into bearing",
            "Install drip irrigation for water efficiency",
            "Regular pruning for better fruit quality",
            "Control fruit borer and aphids effectively",
            "Harvest fruits when they develop characteristic color and sound"
        ]
    },
    "banana": {
        "name": "Banana",
        "duration_days": 365,  # Annual crop cycle
        "best_planting_months": [6, 7, 8, 2, 3],  # Monsoon and spring
        "water_requirement": "High - 200-250mm per month",
        "fertilizer": "NPK 200:100:300 g/plant/month",
        "soil_ph_range": "6.0-7.5",
        "temperature_range": "26-30°C",
        "stages": [
            {"stage": "Plantation", "duration_days": 15, "description": "Plant tissue culture plantlets or suckers"},
            {"stage": "Establishment", "duration_days": 60, "description": "Root development and early growth"},
            {"stage": "Vegetative Growth", "duration_days": 180, "description": "Pseudostem and leaf development"},
            {"stage": "Flower Emergence", "duration_days": 30, "description": "Inflorescence emergence and flowering"},
            {"stage": "Bunch Development", "duration_days": 90, "description": "Fruit formation and filling"},
            {"stage": "Maturation", "duration_days": 30, "description": "Fruit maturation and harvest"},
            {"stage": "Ratooning", "duration_days": 15, "description": "Select and manage ratoon suckers"}
        ],
        "tips": [
            "Plant during monsoon for better establishment",
            "Maintain adequate soil moisture throughout",
            "Remove excess suckers for better bunch quality",
            "Control nematodes, weevils, and fungal diseases",
            "Harvest at 75% maturity for better storage life"
        ]
    },
    "mango": {
        "name": "Mango",
        "duration_days": 1825,  # 5 years to establish, then annual cycles
        "best_planting_months": [7, 8, 2, 3],  # Monsoon and spring
        "water_requirement": "Moderate - Deep but infrequent irrigation",
        "fertilizer": "NPK 500:250:750 g/plant/year for young trees",
        "soil_ph_range": "5.5-7.5",
        "temperature_range": "24-30°C",
        "stages": [
            {"stage": "Plantation", "duration_days": 30, "description": "Plant grafted saplings with proper spacing"},
            {"stage": "Establishment", "duration_days": 730, "description": "Root and canopy establishment"},
            {"stage": "Juvenile Growth", "duration_days": 1095, "description": "Vegetative growth for 3-4 years"},
            {"stage": "Flowering", "duration_days": 60, "description": "Flower initiation and development"},
            {"stage": "Fruit Development", "duration_days": 100, "description": "Fruit setting and growth"},
            {"stage": "Maturation", "duration_days": 30, "description": "Fruit ripening"},
            {"stage": "Dormancy", "duration_days": 120, "description": "Post-harvest rest period"}
        ],
        "tips": [
            "Requires 4-6 years to come into commercial bearing",
            "Avoid waterlogging during flowering period",
            "Practice flowering regulation for better fruiting",
            "Control mango hopper and fruit fly effectively",
            "Harvest at proper maturity stage for better quality"
        ]
    },
    "grapes": {
        "name": "Grapes",
        "duration_days": 1095,  # 3 years to establish, then annual cycles
        "best_planting_months": [1, 2, 11, 12],  # Winter months
        "water_requirement": "Moderate - Drip irrigation essential",
        "fertilizer": "NPK 300:150:300 g/vine/year in splits",
        "soil_ph_range": "6.5-8.0",
        "temperature_range": "15-35°C",
        "stages": [
            {"stage": "Plantation", "duration_days": 30, "description": "Plant grafted vines with support system"},
            {"stage": "Establishment", "duration_days": 365, "description": "Root establishment and training"},
            {"stage": "Canopy Development", "duration_days": 730, "description": "Vine training and pruning"},
            {"stage": "Pruning", "duration_days": 15, "description": "Annual pruning for fruit production"},
            {"stage": "Flowering", "duration_days": 30, "description": "Flower clusters develop"},
            {"stage": "Fruit Development", "duration_days": 90, "description": "Berry formation and growth"},
            {"stage": "Ripening", "duration_days": 30, "description": "Sugar accumulation and harvest"}
        ],
        "tips": [
            "Install trellis system for proper vine support",
            "Practice canopy management for better fruit quality",
            "Apply growth regulators for seedless varieties",
            "Control downy mildew and powdery mildew",
            "Harvest at optimal sugar content (18-22 Brix)"
        ]
    },
    "watermelon": {
        "name": "Watermelon",
        "duration_days": 85,
        "best_planting_months": [2, 3, 6, 7],  # Summer and Kharif
        "water_requirement": "Moderate - Deep watering less frequently",
        "fertilizer": "NPK 100:50:50 kg/ha with organic matter",
        "soil_ph_range": "6.0-7.5",
        "temperature_range": "22-30°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 7, "description": "Prepare raised beds with good drainage"},
            {"stage": "Sowing", "duration_days": 3, "description": "Direct seeding or transplanting"},
            {"stage": "Germination", "duration_days": 7, "description": "Emergence in 5-8 days"},
            {"stage": "Vine Development", "duration_days": 30, "description": "Vine elongation and leaf development"},
            {"stage": "Flowering", "duration_days": 15, "description": "Male and female flowers appear"},
            {"stage": "Fruit Setting", "duration_days": 10, "description": "Pollination and fruit setting"},
            {"stage": "Fruit Development", "duration_days": 25, "description": "Rapid fruit growth and size increase"},
            {"stage": "Maturation", "duration_days": 10, "description": "Sugar accumulation and harvest"}
        ],
        "tips": [
            "Provide adequate space for vine spread",
            "Mulch around plants to conserve moisture",
            "Hand pollination may be needed in covered cultivation",
            "Control fruit fly and aphids using IPM",
            "Test fruit maturity by thumping sound and ground spot color"
        ]
    },
    "muskmelon": {
        "name": "Muskmelon",
        "duration_days": 80,
        "best_planting_months": [2, 3, 6, 7],  # Summer and Kharif
        "water_requirement": "Moderate - Avoid overhead irrigation",
        "fertilizer": "NPK 80:40:40 kg/ha with compost",
        "soil_ph_range": "6.0-7.0",
        "temperature_range": "25-35°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 5, "description": "Prepare well-drained beds"},
            {"stage": "Sowing", "duration_days": 3, "description": "Direct seeding or transplanting seedlings"},
            {"stage": "Germination", "duration_days": 6, "description": "Quick emergence in 4-7 days"},
            {"stage": "Vine Growth", "duration_days": 25, "description": "Vine development and spreading"},
            {"stage": "Flowering", "duration_days": 15, "description": "Male and female flower development"},
            {"stage": "Fruit Setting", "duration_days": 8, "description": "Pollination and early fruit development"},
            {"stage": "Fruit Growth", "duration_days": 20, "description": "Rapid fruit enlargement"},
            {"stage": "Ripening", "duration_days": 8, "description": "Aroma development and harvest"}
        ],
        "tips": [
            "Ensure good air circulation to prevent diseases",
            "Support heavy fruits to prevent vine damage",
            "Control powdery mildew and downy mildew",
            "Harvest when fruits develop characteristic aroma",
            "Handle carefully during harvest to prevent bruising"
        ]
    },
    "apple": {
        "name": "Apple",
        "duration_days": 1825,  # 5 years to establish, then annual cycles
        "best_planting_months": [12, 1, 2],  # Winter months
        "water_requirement": "Moderate - Deep watering required",
        "fertilizer": "NPK 400:200:400 g/tree/year for young trees",
        "soil_ph_range": "5.5-7.0",
        "temperature_range": "15-25°C with winter chill",
        "stages": [
            {"stage": "Plantation", "duration_days": 30, "description": "Plant grafted saplings in winter"},
            {"stage": "Establishment", "duration_days": 730, "description": "Root and shoot establishment"},
            {"stage": "Training", "duration_days": 1095, "description": "Canopy development and shaping"},
            {"stage": "Dormancy", "duration_days": 90, "description": "Winter rest period with chill accumulation"},
            {"stage": "Flowering", "duration_days": 30, "description": "Bud break and flowering"},
            {"stage": "Fruit Development", "duration_days": 120, "description": "Fruit setting and growth"},
            {"stage": "Maturation", "duration_days": 30, "description": "Color development and harvest"}
        ],
        "tips": [
            "Requires 600-1000 chill hours below 7°C",
            "Install proper drainage system",
            "Practice annual pruning for better fruiting",
            "Control scab, fire blight, and codling moth",
            "Harvest at proper maturity based on variety"
        ]
    },
    "orange": {
        "name": "Orange",
        "duration_days": 1460,  # 4 years to establish, then annual cycles
        "best_planting_months": [6, 7, 8],  # Monsoon season
        "water_requirement": "Moderate - Regular irrigation needed",
        "fertilizer": "NPK 500:250:500 g/tree/year for mature trees",
        "soil_ph_range": "6.0-7.5",
        "temperature_range": "13-37°C",
        "stages": [
            {"stage": "Plantation", "duration_days": 30, "description": "Plant grafted saplings with proper spacing"},
            {"stage": "Establishment", "duration_days": 730, "description": "Root establishment phase"},
            {"stage": "Vegetative Growth", "duration_days": 730, "description": "Canopy development"},
            {"stage": "Flowering", "duration_days": 45, "description": "Multiple flushes of flowering"},
            {"stage": "Fruit Development", "duration_days": 240, "description": "Fruit setting and growth"},
            {"stage": "Maturation", "duration_days": 60, "description": "Color development and harvest"},
            {"stage": "Post Harvest", "duration_days": 30, "description": "Pruning and fertilization"}
        ],
        "tips": [
            "Requires 3-4 years to come into bearing",
            "Maintain soil moisture during fruit development",
            "Control citrus canker and leaf miner",
            "Apply micronutrients to prevent deficiency",
            "Harvest when fruits develop full color and juice content"
        ]
    },
    "papaya": {
        "name": "Papaya",
        "duration_days": 365,  # Annual fruiting cycle
        "best_planting_months": [5, 6, 7, 2, 3],  # Monsoon and spring
        "water_requirement": "High - Consistent moisture required",
        "fertilizer": "NPK 200:200:400 g/plant/month",
        "soil_ph_range": "6.0-7.0",
        "temperature_range": "22-28°C",
        "stages": [
            {"stage": "Plantation", "duration_days": 15, "description": "Plant healthy seedlings or tissue culture plants"},
            {"stage": "Establishment", "duration_days": 60, "description": "Root development and early growth"},
            {"stage": "Vegetative Growth", "duration_days": 120, "description": "Rapid stem and leaf development"},
            {"stage": "Sex Determination", "duration_days": 30, "description": "Flowering reveals plant sex"},
            {"stage": "Flowering", "duration_days": 30, "description": "Continuous flowering in female/hermaphrodite plants"},
            {"stage": "Fruit Development", "duration_days": 120, "description": "Fruit formation and growth"},
            {"stage": "Harvesting", "duration_days": 180, "description": "Continuous harvest for 4-6 years"}
        ],
        "tips": [
            "Plant 3-4 seedlings per pit and select best plant after sexing",
            "Provide wind protection in exposed areas",
            "Maintain good drainage to prevent root rot",
            "Control papaya ring spot virus and fruit fly",
            "Harvest fruits at color break stage for longer shelf life"
        ]
    },
    "coconut": {
        "name": "Coconut",
        "duration_days": 2555,  # 7 years to establish, then continuous
        "best_planting_months": [5, 6, 7],  # Beginning of monsoon
        "water_requirement": "High - 600-1200mm annually",
        "fertilizer": "NPK 500:320:1200 g/palm/year",
        "soil_ph_range": "5.2-8.0",
        "temperature_range": "27-35°C",
        "stages": [
            {"stage": "Nursery", "duration_days": 365, "description": "Seednut germination and nursery raising"},
            {"stage": "Plantation", "duration_days": 30, "description": "Transplant 12-month-old seedlings"},
            {"stage": "Establishment", "duration_days": 1095, "description": "Root and canopy establishment"},
            {"stage": "Pre-bearing", "duration_days": 1095, "description": "Vegetative growth phase"},
            {"stage": "Flowering", "duration_days": 365, "description": "First flowering after 5-7 years"},
            {"stage": "Fruit Development", "duration_days": 365, "description": "12 months from flower to mature nut"},
            {"stage": "Production", "duration_days": 18250, "description": "Productive phase for 50+ years"}
        ],
        "tips": [
            "Requires 7-10 years to come into bearing",
            "Plant during onset of monsoon for better establishment",
            "Maintain crown cleaning and fertilization regularly",
            "Control rhinoceros beetle and red palm weevil",
            "Harvest nuts at 11-12 months for maximum copra content"
        ]
    },
    "cotton": {
        "name": "Cotton",
        "duration_days": 180,
        "best_planting_months": [5, 6],  # May-June
        "water_requirement": "High - 700-1300mm total requirement",
        "fertilizer": "NPK 120:60:60 kg/ha in splits",
        "soil_ph_range": "5.8-8.2",
        "temperature_range": "21-27°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 15, "description": "Deep plowing and ridge preparation"},
            {"stage": "Sowing", "duration_days": 5, "description": "Sow delinted seeds at proper depth"},
            {"stage": "Germination", "duration_days": 8, "description": "Emergence in 5-10 days"},
            {"stage": "Square Formation", "duration_days": 45, "description": "Flower buds (squares) develop"},
            {"stage": "Flowering", "duration_days": 45, "description": "White flowers turn pink and shed"},
            {"stage": "Boll Development", "duration_days": 50, "description": "Cotton bolls develop and mature"},
            {"stage": "Boll Opening", "duration_days": 20, "description": "Bolls burst open revealing cotton"},
            {"stage": "Harvesting", "duration_days": 30, "description": "Multiple hand pickings"}
        ],
        "tips": [
            "Maintain proper plant population of 50,000-75,000/ha",
            "Apply adequate phosphorus for root development",
            "Control bollworm complex using IPM approach",
            "Maintain soil moisture during flowering and boll development",
            "Harvest cotton at proper moisture content (7-8%)"
        ]
    },
    "jute": {
        "name": "Jute",
        "duration_days": 120,
        "best_planting_months": [3, 4, 5],  # March-May
        "water_requirement": "High - Requires waterlogged conditions for retting",
        "fertilizer": "NPK 40:17:17 kg/ha. Apply in splits",
        "soil_ph_range": "4.8-5.8",
        "temperature_range": "24-37°C",
        "stages": [
            {"stage": "Land Preparation", "duration_days": 10, "description": "Puddling for fine seedbed"},
            {"stage": "Sowing", "duration_days": 3, "description": "Broadcasting seeds in puddled field"},
            {"stage": "Germination", "duration_days": 7, "description": "Quick emergence in 4-8 days"},
            {"stage": "Vegetative Growth", "duration_days": 60, "description": "Rapid height increase and leaf development"},
            {"stage": "Flowering", "duration_days": 15, "description": "Small yellow flowers appear"},
            {"stage": "Fiber Development", "duration_days": 30, "description": "Fiber quality improves with maturity"},
            {"stage": "Harvesting", "duration_days": 5, "description": "Cut plants at ground level"},
            {"stage": "Retting", "duration_days": 20, "description": "Water retting to separate fibers"}
        ],
        "tips": [
            "Requires high humidity and rainfall during growing period",
            "Harvest at proper maturity for best fiber quality",
            "Ret in clean stagnant water for 15-20 days",
            "Control stem weevil and semilooper",
            "Grade fiber properly for better market price"
        ]
    },
    "coffee": {
        "name": "Coffee",
        "duration_days": 1460,  # 4 years to establish, then annual cycles
        "best_planting_months": [6, 7],  # Monsoon season
        "water_requirement": "High - 1500-2000mm annually with dry period",
        "fertilizer": "NPK 100:50:100 g/plant/year for young plants",
        "soil_ph_range": "6.0-6.5",
        "temperature_range": "15-28°C",
        "stages": [
            {"stage": "Nursery", "duration_days": 180, "description": "Raise seedlings in nursery"},
            {"stage": "Plantation", "duration_days": 30, "description": "Transplant 6-8 month old seedlings"},
            {"stage": "Establishment", "duration_days": 730, "description": "Root and canopy establishment"},
            {"stage": "Pre-bearing", "duration_days": 730, "description": "Vegetative growth phase"},
            {"stage": "Flowering", "duration_days": 30, "description": "White fragrant flowers appear"},
            {"stage": "Berry Development", "duration_days": 240, "description": "Green berries develop and mature"},
            {"stage": "Harvesting", "duration_days": 90, "description": "Hand pick ripe red berries"},
            {"stage": "Processing", "duration_days": 30, "description": "Wet or dry processing of berries"}
        ],
        "tips": [
            "Requires 3-4 years to come into bearing",
            "Provide 50% shade for optimal growth",
            "Maintain soil moisture throughout the year",
            "Control white stem borer and leaf rust",
            "Process berries within 24 hours of harvest for best quality"
        ]
    }
}

def calculate_planting_date(crop_name: str, current_month: int) -> str:
    """Calculate optimal planting date based on crop and current month"""
    crop_data = CROP_GROWING_DATABASE.get(crop_name.lower())
    if not crop_data:
        return "Contact local agricultural extension for planting guidance"
    
    best_months = crop_data["best_planting_months"]
    current_year = datetime.datetime.now().year
    
    # Find the next best planting month
    for month in best_months:
        if month >= current_month:
            return f"{calendar.month_name[month]} {current_year}"
    
    # If no month found in current year, use first month of next year
    next_month = best_months[0]
    return f"{calendar.month_name[next_month]} {current_year + 1}"

def customize_plan_for_conditions(crop_name: str, soil_type: str, weather_data: Dict, farm_size: float) -> Dict:
    """Customize growing plan based on specific farm conditions"""
    base_plan = CROP_GROWING_DATABASE.get(crop_name.lower())
    if not base_plan:
        return None
    
    # Create a customized copy
    customized_plan = base_plan.copy()
    
    # Adjust recommendations based on soil type
    soil_adjustments = {
        "sandy": {
            "irrigation_adjustment": "Increase irrigation frequency due to sandy soil drainage",
            "fertilizer_adjustment": "Apply fertilizer in smaller, frequent doses"
        },
        "clay": {
            "irrigation_adjustment": "Reduce irrigation frequency but increase quantity",
            "fertilizer_adjustment": "Apply organic matter to improve soil structure"
        },
        "loamy": {
            "irrigation_adjustment": "Standard irrigation schedule suitable",
            "fertilizer_adjustment": "Standard fertilizer application recommended"
        },
        "silty": {
            "irrigation_adjustment": "Monitor drainage to prevent waterlogging",
            "fertilizer_adjustment": "Standard application with good incorporation"
        }
    }
    
    # Add soil-specific adjustments
    soil_adj = soil_adjustments.get(soil_type.lower(), soil_adjustments["loamy"])
    customized_plan["soil_specific_tips"] = [
        soil_adj["irrigation_adjustment"],
        soil_adj["fertilizer_adjustment"]
    ]
    
    # Adjust based on weather conditions
    if weather_data:
        temp = weather_data.get("temperature", 25)
        humidity = weather_data.get("humidity", 70)
        
        weather_tips = []
        if temp > 35:
            weather_tips.append("Provide shade during peak summer temperatures")
        elif temp < 15:
            weather_tips.append("Protect from cold using mulching or row covers")
            
        if humidity > 85:
            weather_tips.append("Ensure good air circulation to prevent fungal diseases")
        elif humidity < 50:
            weather_tips.append("Increase irrigation frequency due to low humidity")
            
        customized_plan["weather_specific_tips"] = weather_tips
    
    # Calculate planting date
    current_month = datetime.datetime.now().month
    customized_plan["recommended_planting_date"] = calculate_planting_date(crop_name, current_month)
    
    # Adjust quantities based on farm size
    if farm_size:
        customized_plan["farm_size_acres"] = farm_size
        # Add farm size specific tips
        if farm_size < 2:
            customized_plan["scale_tips"] = [
                "Focus on intensive cultivation methods",
                "Consider high-value crops for better returns",
                "Use drip irrigation for water efficiency"
            ]
        elif farm_size > 10:
            customized_plan["scale_tips"] = [
                "Consider mechanization for efficiency",
                "Plan crop rotation for soil health",
                "Implement integrated pest management"
            ]
    
    return customized_plan

def get_crop_plan(crop_name: str, soil_type: str = None, weather_data: Dict = None, farm_size: float = None) -> Dict[str, Any]:
    """Get comprehensive growing plan for a specific crop"""
    
    # Get base crop data
    base_plan = CROP_GROWING_DATABASE.get(crop_name.lower())
    if not base_plan:
        return {
            "error": f"Growing plan not available for {crop_name}",
            "available_crops": list(CROP_GROWING_DATABASE.keys())
        }
    
    # Customize plan based on conditions
    if soil_type or weather_data or farm_size:
        customized_plan = customize_plan_for_conditions(crop_name, soil_type, weather_data, farm_size)
    else:
        customized_plan = base_plan.copy()
    
    # Add additional metadata
    customized_plan["generated_date"] = datetime.datetime.now().isoformat()
    customized_plan["crop_category"] = categorize_crop(crop_name)
    
    return customized_plan

def categorize_crop(crop_name: str) -> str:
    """Categorize crop type"""
    cereal_crops = ["rice", "wheat", "maize"]
    pulse_crops = ["chickpea", "kidneybeans", "pigeonpeas", "mothbeans", "mungbean", "blackgram", "lentil"]
    fruit_crops = ["pomegranate", "banana", "mango", "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya", "coconut"]
    cash_crops = ["cotton", "jute", "coffee"]
    
    crop_lower = crop_name.lower()
    
    if crop_lower in cereal_crops:
        return "Cereal Crop"
    elif crop_lower in pulse_crops:
        return "Pulse Crop"
    elif crop_lower in fruit_crops:
        return "Fruit Crop"
    elif crop_lower in cash_crops:
        return "Cash Crop"
    else:
        return "Other Crop"