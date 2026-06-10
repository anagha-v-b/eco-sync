// EcoSync Lifestyle Carbon Impact Coefficient Database
// Units are in kg CO2e (Carbon Dioxide Equivalent)

export const DIET_COEFFICIENTS = {
  meat_heavy: 8.2,     // Daily CO2e footprint for high-meat diets
  average: 5.6,        // Standard mixed diet
  vegetarian: 3.8,     // Meat-free
  vegan: 2.9           // Fully plant-based
};

export const TRANSPORT_COEFFICIENTS = {
  large_gas: 0.32,     // Per km for SUV/truck
  medium_gas: 0.22,    // Per km for mid-size car
  electric: 0.08,      // Per km for EV (grid footprint)
  transit: 0.04,       // Per km for bus/train
  active: 0.0          // Foot/bike
};

export const HOUSING_COEFFICIENTS = {
  gas_heating: 12.5,   // Average daily footprint for natural gas heat
  electric_heat: 7.2,  // Average daily footprint for electric heat/AC
  renewable: 1.5       // Solar or green utility contract
};

export const CONSUMPTION_COEFFICIENTS = {
  high: 14.8,          // High shopper, frequent new items
  average: 8.4,        // Normal consumer
  minimalist: 3.2      // Low waste, upcycler, local shopper
};

// Daily target carbon limit per person to reach 1.5°C climate goals
export const GLOBAL_DAILY_BUDGET = 20.0; // 20 kg CO2e per day

export const HABIT_CATALOG = [
  {
    id: "diet_plant_lunch",
    title: "Plant-Based Lunch",
    category: "diet",
    description: "Substituted meat with vegetables, grains, or beans for your midday meal.",
    impact: 1.8, // saves 1.8 kg CO2
    difficulty: "easy"
  },
  {
    id: "diet_plant_day",
    title: "Full Vegan Day",
    category: "diet",
    description: "Excluded all animal products from your diet today.",
    impact: 4.5,
    difficulty: "medium"
  },
  {
    id: "transit_subway",
    title: "Commute by Subway/Train",
    category: "transport",
    description: "Took the train or subway instead of driving a standard vehicle.",
    impact: 3.2,
    difficulty: "easy"
  },
  {
    id: "transit_active",
    title: "Walk or Bike Commute",
    category: "transport",
    description: "Chose active human power for your commute (minimum 3 km).",
    impact: 4.8,
    difficulty: "medium"
  },
  {
    id: "transit_carpool",
    title: "Shared Commute / Carpool",
    category: "transport",
    description: "Carpooled with at least one other person to reduce vehicle trip counts.",
    impact: 2.1,
    difficulty: "easy"
  },
  {
    id: "energy_line_dry",
    title: "Line Dry Laundry",
    category: "household",
    description: "Skipped the electric tumble dryer and air-dried a load of laundry.",
    impact: 2.4,
    difficulty: "easy"
  },
  {
    id: "energy_unplug",
    title: "Zero-Standby Sweep",
    category: "household",
    description: "Unplugged chargers, TVs, and monitors from the wall before leaving or sleeping.",
    impact: 0.4,
    difficulty: "easy"
  },
  {
    id: "energy_short_shower",
    title: "5-Minute Shower",
    category: "household",
    description: "Kept hot water usage under 5 minutes to conserve gas/electric heating.",
    impact: 1.2,
    difficulty: "easy"
  },
  {
    id: "consume_vintage",
    title: "Sourced Secondhand",
    category: "consumption",
    description: "Bought a needed item (clothing, furniture, tool) vintage/secondhand.",
    impact: 8.5,
    difficulty: "medium"
  },
  {
    id: "consume_reusable",
    title: "Zero-Single-Use Day",
    category: "consumption",
    description: "Refused all single-use plastics, packaging, and disposable cups today.",
    impact: 0.8,
    difficulty: "medium"
  },
  {
    id: "consume_repair",
    title: "Repaired Over Replaced",
    category: "consumption",
    description: "Mended, patched, or fixed a broken device or garment rather than replacing it.",
    impact: 15.0,
    difficulty: "hard"
  }
];
