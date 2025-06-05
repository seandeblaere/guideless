import { PlacesClient } from "@googlemaps/places";
import { IPlace } from "../../domain/interfaces/IPlace";
import { NearbyPlacesRequestData } from "./dto/NearbyPlacesRequestData";
import { NearbyPlacesParams } from "./dto/NearbyPlacesParams";
import { API_CALL_OPTIONS } from "../../shared/constants/ApiConstants";
import { ApiRequestBuilder } from "../../builders/ApiRequestBuilder";
import { apiConfig } from "../../config/ApiConfig";

export class PlacesService {
    private placesClient: PlacesClient;
    private places: IPlace[] = [];
    private apiRequestBuilder: ApiRequestBuilder;

    constructor() {
        this.placesClient = new PlacesClient({
            key: apiConfig.googleMapsApiKey
        });
        this.apiRequestBuilder = new ApiRequestBuilder("nearbyPlacesRequest");
    }

    public async searchNearbyPlaces(params: NearbyPlacesParams): Promise<IPlace[]> {
        const requestData = this.getRequestData(params);

        try {
            const [response] = await this.placesClient.searchNearby(requestData, API_CALL_OPTIONS.NEARBY_PLACES);

            if(!response.places) {
                return [];
            }

            if(response.places.length <= 0) {
                return [];
            }
            
            this.places = response.places.map(place => ({
                id: place.id ?? "",
                name: place.displayName?.text ?? "",
                rating: place.rating ?? 0,
                userRatingCount: place.userRatingCount ?? 0,
                types: place.types ?? [],
                coordinates: place.location ? {
                    latitude: place.location.latitude!,
                    longitude: place.location.longitude!
                } : undefined
            })); 

        } catch (error) {
            return [];
        }

        return this.places;
    }

    private getRequestData(params: NearbyPlacesParams): NearbyPlacesRequestData {
        this.apiRequestBuilder.setCoordinates(params.coordinates);
        this.apiRequestBuilder.setDurationMinutes(params.durationMinutes);
        this.apiRequestBuilder.setIncludedTypes(params.includedTypes);

        return this.apiRequestBuilder.build() as NearbyPlacesRequestData;
    }

}
