export interface CategoryConfig {
  id: string;
  name: string;
  distance: string;
  priceINR: number; // 0 for free categories
  isFree: boolean;
  description: string;
  eligibility: string;
  flagOffTime: string;
}

/**
 * Single source of truth for Udupipages Beach Run 2026 Categories & Pricing.
 * 
 * ⚠️ DEVELOPER NOTE / UPDATE BEFORE LAUNCH:
 * The PDF event specification lists 1K/3K as Kids & Senior Citizen Fun Runs (Free),
 * and 5K, 10K, 15K as competitive runs.
 * Default prices below (₹499, ₹799, ₹999) are TBD placeholders as requested.
 * Update priceINR values prior to pointing Razorpay at live production keys.
 */
export const CATEGORIES: Record<string, CategoryConfig> = {
  "3k_fun": {
    id: "3k_fun",
    name: "3K Fun Run",
    distance: "3 Kilometers",
    priceINR: 0, // Free registration
    isFree: true,
    description: "Padukere Ground ➔ Padukare School Ground (3K). Kids & Senior Citizens walk/run.",
    eligibility: "Open to children (<14 yrs) & senior citizens (60+ yrs)",
    flagOffTime: "7:00 AM"
  },
  "1k_3k_fun": {
    id: "3k_fun",
    name: "3K Fun Run",
    distance: "3 Kilometers",
    priceINR: 0, // Free registration
    isFree: true,
    description: "Padukere Ground ➔ Padukare School Ground (3K). Kids & Senior Citizens walk/run.",
    eligibility: "Open to children (<14 yrs) & senior citizens (60+ yrs)",
    flagOffTime: "7:00 AM"
  },
  "5k": {
    id: "5k",
    name: "5K Coastal Challenge",
    distance: "5 Kilometers",
    priceINR: 499, // TBD PLACEHOLDER — UPDATE BEFORE LAUNCH
    isFree: false,
    description: "Padukere Ground ➔ Blue Wave (5K). Scenic coastal challenge for fitness enthusiasts.",
    eligibility: "Age 12 and above",
    flagOffTime: "6:30 AM"
  },
  "10k": {
    id: "10k",
    name: "10K Endurance Run",
    distance: "10 Kilometers",
    priceINR: 799, // TBD PLACEHOLDER — UPDATE BEFORE LAUNCH
    isFree: false,
    description: "Padukere Ground ➔ Mattu Beach (10K). Mid-distance timed beach run.",
    eligibility: "Age 16 and above",
    flagOffTime: "6:00 AM"
  },
  "15k": {
    id: "15k",
    name: "15K Ultimate Beach Marathon",
    distance: "15 Kilometers",
    priceINR: 999, // TBD PLACEHOLDER — UPDATE BEFORE LAUNCH
    isFree: false,
    description: "Padukere Ground ➔ Kapu Light House (15K). Full coastal course challenge.",
    eligibility: "Age 18 and above",
    flagOffTime: "5:30 AM"
  }
};
