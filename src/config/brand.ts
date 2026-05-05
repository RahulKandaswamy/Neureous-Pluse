import type { InsightCategory } from "../domain/contracts.js";

export const brandProfile = {
  name: "Neureos",
  market: "India",
  category: "Pre-workout supplements",
  positioning: "Neuro/focus-angled pre-workout",
  primaryChannel: "Local gyms"
} as const;

export const monitoredCompetitors = [
  "MuscleBlaze",
  "Wellcore",
  "Bigmuscles",
  "Fast&Up",
  "Reckoner",
  "Steadfast"
] as const;

export const defaultMvpCategories: InsightCategory[] = [
  "ingredient_intelligence",
  "competitor_pulse",
  "gym_channel_intelligence",
  "consumer_sentiment"
];
