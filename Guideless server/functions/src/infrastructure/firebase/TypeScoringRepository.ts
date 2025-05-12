import { db } from "../../index";
import { TYPE_SCORING_CATEGORIES } from "../../shared/constants/ScoringConstants";

export const getTypeScoring = async (): Promise<Map<string, string[]>> => {
    const typeScoring = new Map<string, string[]>();
    
    for (const typeCategory of TYPE_SCORING_CATEGORIES) {
      try {
        const snapshot = await db.collection("scoring").doc(typeCategory).get();
        
        if (!snapshot.exists) {
          throw new Error(`Theme ${typeCategory} not found`);
        }
        
        const data = snapshot.data();
        
        if (!data) {
          throw new Error(`Theme ${typeCategory} has no data`);
        }
        
        const allTypes = data.type;
  
        if (!Array.isArray(allTypes) || allTypes.length === 0) {
          throw new Error(`Theme ${typeCategory} has no types`);
        }
  
        typeScoring.set(typeCategory, allTypes);
  
      } catch (error) {
        console.error(`Error fetching theme ${typeCategory}:`, error);
      }
    }
    
    return typeScoring;
};