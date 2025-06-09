import {apiConfig} from "../../config/ApiConfig";

export const API_CALL_OPTIONS = {
  NEARBY_PLACES: {
    otherArgs: {
      headers: {
        "X-Goog-FieldMask": apiConfig.googleMaps.nearByPlaces.fieldMask,
      },
    },
  },
  DISTANCE_MATRIX: {
    otherArgs: {
      headers: {
        "X-Goog-FieldMask": apiConfig.googleMaps.distanceMatrix.fieldMask,
      },
    },
  },
  ROUTE: {
    otherArgs: {
      headers: {
        "X-Goog-FieldMask": apiConfig.googleMaps.route.fieldMask,
      },
    },
  },
} as const;

