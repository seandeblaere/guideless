import {PlacesClient} from "@googlemaps/places";
import {IPlace} from "../../domain/interfaces/IPlace";
import {NearbyPlacesRequestData} from "./dto/NearbyPlacesRequestData";
import {NearbyPlacesParams} from "./dto/NearbyPlacesParams";
import {API_CALL_OPTIONS} from "../../shared/constants/ApiConstants";
import {ApiRequestBuilder} from "../../builders/ApiRequestBuilder";
import {apiConfig} from "../../config/ApiConfig";
import { Client, GeocodeResponse } from "@googlemaps/google-maps-services-js";
import { Coordinates } from "../../shared/types/Coordinates";

export class PlacesService {
  private placesClient: PlacesClient;
  private geocodeClient: Client;
  private places: IPlace[] = [];
  private apiRequestBuilder: ApiRequestBuilder;

  constructor() {
    this.placesClient = new PlacesClient({
      key: apiConfig.googleMaps.apiKey,
    });
    this.apiRequestBuilder = new ApiRequestBuilder("nearbyPlacesRequest");
    this.geocodeClient = new Client({});
  }

  public async searchNearbyPlaces(params: NearbyPlacesParams): Promise<IPlace[]> {
    const requestData = this.getRequestData(params);

    console.log("Request data for nearby places: ", requestData);

    try {
      const [response] = await this.placesClient.searchNearby(requestData, API_CALL_OPTIONS.NEARBY_PLACES);

      console.log("Response for nearby places: ", response);

      if (!response.places) {
        return [];
      }

      if (response.places.length <= 0) {
        return [];
      }

      this.places = response.places.map((place) => ({
        id: place.id ?? "",
        name: place.displayName?.text ?? "",
        rating: place.rating ?? 0,
        userRatingCount: place.userRatingCount ?? 0,
        types: place.types ?? [],
        coordinates: place.location ? {
          latitude: place.location.latitude!,
          longitude: place.location.longitude!,
        } : undefined,
      }));
    } catch (error) {
      console.log("Error for nearby places: ", error);
      return [];
    }

    return this.places;
  }

  public async getGeocode(address?: string): Promise<Coordinates | undefined> {
    if (!address) {
      return undefined;
    }

    try {
      const response: GeocodeResponse = await this.geocodeClient.geocode({
        params: {
          address: address,
          key: apiConfig.googleMaps.apiKey!,
        }
      });
  
      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      }
  
      throw new Error('No geocoding results found for the address');
    } catch (error) {
      throw new Error('Failed to geocode address');
    }
  }

  private getRequestData(params: NearbyPlacesParams): NearbyPlacesRequestData {
    this.apiRequestBuilder.setStartLocation(params.startLocation);
    if (params.endLocation) {
      this.apiRequestBuilder.setEndLocation(params.endLocation);
    }
    this.apiRequestBuilder.setDurationMinutes(params.durationMinutes);
    this.apiRequestBuilder.setIncludedTypes(params.includedTypes);

    return this.apiRequestBuilder.build() as NearbyPlacesRequestData;
  }
}
