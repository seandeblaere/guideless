export const DEFAULT_ROUTE_WEIGHTS = {
    theme: 0.5,
    quality: 0.3,
    cluster: 0.2,
} as const;

export const QUALITY_SCORING = {
    RANKING_FACTOR: 0.15,
    DEFAULT_SCORE: 0.4,
    CONFIDENCE_FACTOR: 0.05,
    AVERAGE_RATING: 0.6
} as const;

export const CLUSTER_SCORING = {
    CONNECTIVITY_FACTOR: 0.4,
    GATEWAY_FACTOR: 0.3,
    NEARBY_QUALITY_FACTOR: 0.3,
} as const;


