export const apiConfig = {
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    nearByPlaces: {
      fieldMask: "places.displayName,places.id,places.rating,places.userRatingCount,places.types,places.location.latitude,places.location.longitude",
    },
    distanceMatrix: {
      fieldMask: "originIndex,destinationIndex,duration",
    },
    route: {
      fieldMask: "routes.duration,routes.distanceMeters,routes.polyline,routes.optimizedIntermediateWaypointIndex",
    },
  },
  googleGemini: {
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    model: "gemini-2.0-flash",
    version: "v1alpha",
    systemInstruction: "You are a knowledgeable local tour guide. Generate engaging, informative content about places of interest. Keep responses concise (2-3 sentences) and engaging. Focus on interesting facts, local tips, or stories that would enhance a visitor's experience.",
    contentFocus: {
      restaurant: "Share a local dining tip, signature dish recommendation, or food-related local knowledge. It should be relatable to the type of restaurant.",
      touristAttraction: "Tell an interesting historical story, cultural significance, or fascinating fact about this place.",
      nature: "Describe what makes this natural area special, wildlife, or seasonal highlights.",
      general: "Share what makes this place interesting and worth visiting.",
    },
  },
} as const;
