export const CONTENT_TYPES = {
  nature_info: ["botanical garden", "park", "national_park", "garden", "hiking area", "state_park"],
  food_tip: ["restaurant", "food", "cafe", "bakery", "cafeteria"],
  historical_context: ["historical_landmark", "historical_place", "monument"],
  story: ["historical_landmark", "historical_place", "monument", "cultural_landmark", "cultural_place", "sculpture", "amphitheatre", "plaza"],
  fun_fact: ["historical_landmark", "historical_place", "monument", "cultural_landmark", "cultural_place", "observation_deck", "opera_house", "concert_hall"],
};

export const CONTENT_TYPE_PROMPT = {
  nature_info: "Describe what makes this natural area special, wildlife, or seasonal highlights.",
  food_tip: "Share a local dining tip, signature dish recommendation, or food-related local knowledge.",
  historical_context: "Tell an interesting historical story, cultural significance, or fascinating fact about this place.",
  story: "Share a story about this place, its history, or its significance. The story can be a local tale, a historical event, or a cultural tradition, or just how it came to be, or a story about the people who lived there.",
  fun_fact: "Share a fun fact about this place, its history, or its significance.",
} as const;
