import {db} from "../../index";
import {ThemeCategory} from "../../shared/types/ThemeCategory";

export const getThemeTypes = async (themes: ThemeCategory[]): Promise<string[]> => {
  const themeTypes = new Set<string>();

  for (const theme of themes) {
    try {
      const snapshot = await db.collection("themes").doc(theme).get();

      if (!snapshot.exists) {
        throw new Error(`Theme ${theme} not found`);
      }

      const data = snapshot.data();

      if (!data) {
        throw new Error(`Theme ${theme} has no data`);
      }

      const allTypes = data.types;

      if (!Array.isArray(allTypes) || allTypes.length === 0) {
        throw new Error(`Theme ${theme} has no types`);
      }

      allTypes.forEach((type) => themeTypes.add(type));
    } catch (error) {
      console.error(`Error fetching theme ${theme}:`, error);
    }
  }

  return Array.from(themeTypes);
};
