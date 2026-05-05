import type { SourceSeed } from "../domain/contracts.js";

import { defaultMvpCategories } from "./brand.js";

export const sourceSeeds: SourceSeed[] = [
  {
    id: "google-news-preworkout-india",
    label: "Google News - Pre-workout India",
    kind: "rss",
    url: "https://news.google.com/rss/search?q=pre+workout+India+supplements",
    categories: defaultMvpCategories,
    enabled: true
  },
  {
    id: "google-news-fssai-supplements",
    label: "Google News - FSSAI supplements",
    kind: "rss",
    url: "https://news.google.com/rss/search?q=FSSAI+supplements+India",
    categories: ["ingredient_intelligence", "competitor_pulse"],
    enabled: true
  },
  {
    id: "muscleblaze-preworkout",
    label: "MuscleBlaze pre-workout page",
    kind: "html",
    url: "https://www.muscleblaze.com/",
    categories: ["competitor_pulse", "consumer_sentiment"],
    enabled: true
  },
  {
    id: "wellcore-homepage",
    label: "Wellcore homepage",
    kind: "html",
    url: "https://www.wellversed.in/",
    categories: ["competitor_pulse"],
    enabled: true
  },
  {
    id: "reddit-preworkout",
    label: "Reddit r/preworkout",
    kind: "reddit",
    url: "https://www.reddit.com/r/preworkout/.json",
    categories: ["consumer_sentiment", "ingredient_intelligence"],
    enabled: true
  },
  {
    id: "reddit-fitnessindia",
    label: "Reddit r/FitnessIndia",
    kind: "reddit",
    url: "https://www.reddit.com/r/FitnessIndia/.json",
    categories: ["consumer_sentiment", "gym_channel_intelligence"],
    enabled: true
  },
  {
    id: "reddit-indianbodybuilding",
    label: "Reddit r/IndianBodyBuilding",
    kind: "reddit",
    url: "https://www.reddit.com/r/IndianBodyBuilding/.json",
    categories: ["consumer_sentiment", "gym_channel_intelligence"],
    enabled: true
  }
];
