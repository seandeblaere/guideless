import { POI } from "../../domain/models/POI";
import { RawScore } from "../../shared/types/RawScore";
import { QUALITY_SCORING } from "../../shared/constants/ScoringConstants";

export class QualityScorer {
    
    public static calculateScores(pois: POI[]): void {
        const rawQualityScores: RawScore[] = pois.map(poi => {
            return {
                poiId: poi.id,
                rawScore: this.calculateIndividualScore(poi)
            }
        });

        const appliedArrayPositionBonus = this.applyArrayPositionBonus(rawQualityScores);
        this.applyScoring(pois, appliedArrayPositionBonus);
    }

    private static calculateIndividualScore(poi: POI): number {
        if (!poi.rating) {
            return QUALITY_SCORING.DEFAULT_SCORE;
        }
        
        const ratingComponent = poi.rating / 5;

        const ratingCount = poi.userRatingCount || 0;
        
        const confidenceFactor = 1 / (1 + Math.exp(-QUALITY_SCORING.CONFIDENCE_FACTOR * ratingCount + 0.7));
        
        const adjustedRating = (ratingComponent * confidenceFactor) + (QUALITY_SCORING.AVERAGE_RATING * (1 - confidenceFactor));
        
        return adjustedRating;
    }
    
    private static applyArrayPositionBonus(rawQualityScores: { poiId: string, rawScore: number }[]): { poiId: string, rawScore: number }[] {
        rawQualityScores.forEach((score, index) => {
            const positionFactor = Math.max(0, 1 - (index / rawQualityScores.length));
            const positionBonus = positionFactor * QUALITY_SCORING.RANKING_FACTOR;
            
            score.rawScore = score.rawScore * (1 + positionBonus);
        });

        return rawQualityScores;
    }
    
    private static applyScoring(pois: POI[], rawQualityScores: RawScore[]): void {
        const maxScore = Math.max(...rawQualityScores.map(score => score.rawScore));
        
        if (maxScore > 0) {
            rawQualityScores.forEach(score => {
                const poi = pois.find(poi => poi.id === score.poiId);
                if (poi) {
                    poi.qualityScore = score.rawScore / maxScore;
                }
            });
        }
    }
}