export const DEFAULT_ROUTE_WEIGHTS = {
  theme: 0.35,
  quality: 0.35,
  cluster: 0.3,
} as const;

export const QUALITY_SCORING = {
  RANKING_FACTOR: 0.15,
  DEFAULT_SCORE: 0.4,
  CONFIDENCE_FACTOR: 0.05,
  AVERAGE_RATING: 0.6,
} as const;

export const CLUSTER_SCORING = {
  CONNECTIVITY_FACTOR: 0.4,
  GATEWAY_FACTOR: 0.2,
  NEARBY_QUALITY_FACTOR: 0.4,
  QUALITY_WEIGHT: 0.5,
  THEME_WEIGHT: 0.5,
} as const;

export const TYPE_SCORING_CATEGORIES = ["high", "mid", "low"] as const;

export const TYPE_SCORING = {
  high: 5,
  mid: 3,
  low: 1,
} as const;


