import {POI} from "../../domain/models/POI";
import {RawScore} from "../../shared/types/RawScore";
import {getTypeScoring} from "../../infrastructure/firebase/TypeScoringRepository";
import {TYPE_SCORING} from "../../shared/constants/ScoringConstants";

export class ThemeScorer {
  public static async calculateScores(pois: POI[]): Promise<void> {
    const typeScoring = await getTypeScoring();

    const rawQualityScores: RawScore[] = pois.map((poi) => {
      return {
        poiId: poi.id,
        rawScore: this.calculateIndividualScore(poi, typeScoring),
      };
    });

    this.applyScoring(pois, rawQualityScores);
  }

  private static calculateIndividualScore(poi: POI, typeScoring: Map<string, string[]>): number {
    let score = 0;
    poi.types?.forEach((type) => {
      if (typeScoring.get("high")?.includes(type)) {
        score += TYPE_SCORING.high;
      } else if (typeScoring.get("mid")?.includes(type)) {
        score += TYPE_SCORING.mid;
      } else if (typeScoring.get("low")?.includes(type)) {
        score += TYPE_SCORING.low;
      }
    });
    return score;
  }

  private static applyScoring(pois: POI[], rawThemeScores: RawScore[]): void {
    const maxScore = Math.max(...rawThemeScores.map((score) => score.rawScore));

    if (maxScore > 0) {
      rawThemeScores.forEach((score) => {
        const poi = pois.find((poi) => poi.id === score.poiId);
        if (poi) {
          poi.themeScore = Number((score.rawScore / maxScore).toFixed(3));
        }
      });
    }
  }
}
