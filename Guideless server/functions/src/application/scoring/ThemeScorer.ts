import { POI } from "../../domain/models/POI";
import { RawScore } from "../../shared/types/RawScore";

export class ThemeScorer {
    
    public static calculateScores(pois: POI[]): void {
        const rawQualityScores: RawScore[] = pois.map(poi => {
            return {
                poiId: poi.id,
                rawScore: this.calculateIndividualScore(poi)
            }
        });

        this.applyScoring(pois, rawQualityScores);
    }

    private static calculateIndividualScore(poi: POI): number {
        return 3
    }
    
    private static applyScoring(pois: POI[], rawThemeScores: RawScore[]): void {
        const maxScore = Math.max(...rawThemeScores.map(score => score.rawScore));
        
        if (maxScore > 0) {
            rawThemeScores.forEach(score => {
                const poi = pois.find(poi => poi.id === score.poiId);
                if (poi) {
                    poi.themeScore = score.rawScore / maxScore;
                }
            });
        }
    }
}