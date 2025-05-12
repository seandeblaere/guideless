import { Coordinates } from "../shared/types/Coordinates";
import { ThemeCategory } from "../shared/types/ThemeCategory";
import { Route } from "../domain/models/Route";

export class RouteBuilder {
    private startLocation?: Coordinates;
    private endLocation?: Coordinates;
    private durationMinutes?: number;
    private isRoundTrip: boolean = false;
    private maxPOICount?: number;
    private themeCategories: ThemeCategory[] = [];

    withStartLocation(location: Coordinates): RouteBuilder {
        this.startLocation = location;
        return this;
    }

    withEndLocation(location: Coordinates): RouteBuilder {
        this.endLocation = location;
        return this;
    }

    withDuration(minutes: number): RouteBuilder {
        if (minutes <= 0) {
            throw new Error("Duration must be positive");
        }
        this.durationMinutes = minutes;
        return this;
    }

    asRoundTrip(isRoundTrip: boolean = true): RouteBuilder {
        this.isRoundTrip = isRoundTrip;
        return this;
    }

    withMaxPOIs(count: number): RouteBuilder {
        if (count <= 0) {
            throw new Error("POI count must be positive");
        }
        this.maxPOICount = count;
        return this;
    }

    withThemeCategories(categories: ThemeCategory[]): RouteBuilder {
        this.themeCategories = categories;
        return this;
    }

    build(): Route {
        if (!this.startLocation) {
            throw new Error("Start location is required");
        }
        
        if (!this.durationMinutes) {
            throw new Error("Duration is required");
        }
        
        if (!this.isRoundTrip && !this.endLocation) {
            throw new Error("End location is required for non-round-trip routes");
        }
        
        if(!this.maxPOICount) {
            throw new Error("Max POI count is required");
        }

        if(this.themeCategories.length === 0) {
            throw new Error("Theme categories are required");
        }

        return new Route(
            this.startLocation,
            this.durationMinutes,
            this.isRoundTrip,
            this.maxPOICount,
            this.themeCategories,
            this.endLocation
        );
    }
}
