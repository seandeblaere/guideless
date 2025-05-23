import { POI } from "../../domain/models/POI";
import { RawScore } from "../../shared/types/RawScore";
import { CLUSTER_SCORING } from "../../shared/constants/ScoringConstants";

export class ClusterScorer {

    public static calculateScores(availablePois: POI[], globalAvgDistance: number, isolatedHighScoringPois: POI[]): void {
        const rawClusterScores: RawScore[] = availablePois.map(poi => {
            return {
                poiId: poi.id,
                rawScore: this.calculateIndividualScore(poi, availablePois, globalAvgDistance, isolatedHighScoringPois)
            }
        });
        
        this.applyScoring(availablePois, rawClusterScores);
    }

    private static calculateIndividualScore(poi: POI, availablePois: POI[], globalAvgDistance: number, isolatedHighScoringPois: POI[]): number {
        const connectivityScore = this.calculateConnectivityScore(poi, availablePois, globalAvgDistance);
        const gatewayScore = this.calculateGatewayScore(poi, isolatedHighScoringPois, globalAvgDistance);
        const nearbyQualityScore = this.calculateNearbyQualityScore(poi, availablePois, globalAvgDistance);
        
        return CLUSTER_SCORING.CONNECTIVITY_FACTOR * connectivityScore  + 
            CLUSTER_SCORING.GATEWAY_FACTOR * gatewayScore + 
            CLUSTER_SCORING.NEARBY_QUALITY_FACTOR * nearbyQualityScore;
    }

    private static calculateConnectivityScore(poi: POI, availablePois: POI[], globalAvgDistance: number): number {
        const distances = availablePois
            .filter(p => p.id !== poi.id)
            .map(p => poi.getDistanceToPOI(p.id));
        
        const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
        
        return Math.exp(-avgDistance / globalAvgDistance);
    }

    private static calculateGatewayScore(poi: POI, isolatedHighScoringPois: POI[], globalAvgDistance: number): number {
        let gatewayScore = 0;

        for (const isolatedPoi of isolatedHighScoringPois) {
            const distance = poi.getDistanceToPOI(isolatedPoi.id);
            if (distance < globalAvgDistance) {
                gatewayScore += isolatedPoi.qualityScore * Math.exp(-distance / 1000);
            }
        }

        return Math.min(1, gatewayScore);
    }

    private static calculateNearbyQualityScore(poi: POI, availablePois: POI[], globalAvgDistance: number): number {
        const nearbyPois = availablePois.filter(p => {
            if (p.id === poi.id) return false;
            const distance = poi.getDistanceToPOI(p.id);
            return distance <= (globalAvgDistance * 0.5);
        });

        if (nearbyPois.length === 0) return 0;

        const totalQualityScore = nearbyPois.reduce((sum, p) => {
            const distance = poi.getDistanceToPOI(p.id);
            const weight = Math.exp(-distance / (globalAvgDistance * 0.5));
            return sum + (p.qualityScore * weight);
        }, 0);
    
        const totalThemeScore = nearbyPois.reduce((sum, p) => {
            const distance = poi.getDistanceToPOI(p.id);
            const weight = Math.exp(-distance / (globalAvgDistance * 0.5));
            return sum + (p.themeScore * weight);
        }, 0);

        const totalWeight = nearbyPois.reduce((sum, p) => {
            const distance = poi.getDistanceToPOI(p.id);
            return sum + Math.exp(-distance / (globalAvgDistance * 0.5));
        }, 0);

        if (totalWeight === 0) return 0;

        const weightedQualityScore = totalQualityScore / totalWeight;
        const weightedThemeScore = totalThemeScore / totalWeight;

        return (weightedQualityScore * CLUSTER_SCORING.QUALITY_WEIGHT) + (weightedThemeScore * CLUSTER_SCORING.THEME_WEIGHT);
    }

    private static applyScoring(availablePois: POI[], rawClusterScores: RawScore[]): void {
        const maxScore = Math.max(...rawClusterScores.map(score => score.rawScore));
        if (maxScore > 0) {
            rawClusterScores.forEach(score => {
                const poi = availablePois.find(p => p.id === score.poiId);
                if (!poi) {
                    throw new Error(`POI with id ${score.poiId} not found`);
                }
                poi.clusterScore = score.rawScore / maxScore;
            });
        }
    }
}
