import {db} from "../../index";
import {ContentGenerationStatus} from "../../shared/enums/ContentGenerationStatus";
import {ContentType} from "../../shared/enums/ContentType";
import {IRouteDocument} from "../../domain/interfaces/IRouteDocument";
import {POIDocument} from "../../domain/interfaces/IPOIDocument";
import {apiConfig} from "../../config/ApiConfig";
import {CONTENT_TYPES, CONTENT_TYPE_PROMPT} from "../../shared/constants/ContentTypeConstants";
import {POIContent, POIContentStructured} from "../../domain/interfaces/IPOIContent";
import {Timestamp} from "firebase-admin/firestore";

export class ContentGenerator {
  private genAI: any;
  private userId: string;
  private routeId: string;
  private routeData: IRouteDocument;

  constructor(userId: string, routeId: string, routeData: IRouteDocument) {
    this.userId = userId;
    this.routeId = routeId;
    this.routeData = routeData;
    this.initializeGenAI();
  }

  private async initializeGenAI() {
    const {GoogleGenAI} = await import("@google/genai");
    this.genAI = new GoogleGenAI({
      apiKey: apiConfig.googleGemini.apiKey,
      apiVersion: apiConfig.googleGemini.version,
    });
  }

  async generateRouteContent(): Promise<void> {
    if (!this.genAI) {
      await this.initializeGenAI();
    }

    try {
      await this.updateRouteContentStatus(ContentGenerationStatus.IN_PROGRESS);

      const poisSnapshot = await db
        .collection("users")
        .doc(this.userId)
        .collection("routes")
        .doc(this.routeId)
        .collection("pois")
        .get();

      const pois = poisSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as POIDocument));

      const contentPromises = pois.map((poi) =>
        this.generatePOIContent(poi)
      );

      await Promise.all(contentPromises);

      await this.updateRouteContentStatus(ContentGenerationStatus.COMPLETED);
    } catch (error) {
      await this.updateRouteContentStatus(ContentGenerationStatus.FAILED);
    }
  }

  private async generatePOIContent(poi: POIDocument): Promise<void> {
    try {
      if (poi.contentReady || poi.content) {
        return;
      }

      const contentTypes = this.determineContentType(poi.types);
      const structuredContent = await this.callGeminiAPI(poi, contentTypes);

      const poiContent: POIContent = {
        contentTypes: contentTypes,
        content: structuredContent,
        generatedAt: Timestamp.now(),
      };

      await db
        .collection("users")
        .doc(this.userId)
        .collection("routes")
        .doc(this.routeId)
        .collection("pois")
        .doc(poi.id!)
        .update({
          content: poiContent,
          contentReady: true,
        });
    } catch (error) {
      console.error(`Error generating content for POI ${poi.id}:`, error);
      throw error;
    }
  }

  private async callGeminiAPI(poi: POIDocument, contentTypes: ContentType[]): Promise<POIContentStructured> {
    const prompt = this.buildPrompt(poi, contentTypes);
    
    const uniqueContentTypes = [...new Set(contentTypes)];
    
    const responseSchema: any = {
      type: "object",
      properties: {},
      required: [],
      propertyOrdering: []
    };

    uniqueContentTypes.forEach(type => {
      responseSchema.properties[type] = {
        type: "string",
        description: this.getContentTypeDescription(type)
      };
      responseSchema.required.push(type);
      responseSchema.propertyOrdering.push(type);
    });

    try {
      const response = await this.genAI.models.generateContent({
        model: apiConfig.googleGemini.model,
        contents: prompt,
        config: {
          systemInstruction: apiConfig.googleGemini.systemInstruction,
          response_mime_type: "application/json",
          response_schema: responseSchema
        },
      });

      let responseText = response.text.trim();
      
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      throw error;
    }
  }

  private buildPrompt(poi: POIDocument, contentTypes: ContentType[]): string {
    const themes = this.routeData.themes.join(", ");
    const poiTypes = poi.types?.join(", ");
    return this.getPromptTemplate(poi, contentTypes, themes, poiTypes);
  }

  private determineContentType(types: string[]): ContentType[] {
    const contentTypes = new Set<ContentType>();
    
    contentTypes.add(ContentType.DESCRIPTION);
    
    for (const type of types) {
      if (CONTENT_TYPES.food_tip.includes(type)) {
        contentTypes.add(ContentType.FOOD_TIP);
      }
      if (CONTENT_TYPES.historical_context.includes(type)) {
        contentTypes.add(ContentType.HISTORICAL_CONTEXT);
      }
      if (CONTENT_TYPES.story.includes(type)) {
        contentTypes.add(ContentType.STORY);
      }
      if (CONTENT_TYPES.fun_fact.includes(type)) {
        contentTypes.add(ContentType.FUN_FACT);
      }
      if (CONTENT_TYPES.nature_info.includes(type)) {
        contentTypes.add(ContentType.NATURE_INFO);
      }
    }
    
    return Array.from(contentTypes);
  }

  private getContentTypeDescription(type: ContentType): string {
    switch (type) {
      case ContentType.STORY:
        return "An engaging story about this place, its history, or significance (max 250 words)";
      case ContentType.FOOD_TIP:
        return "Local dining recommendations, signature dishes, or food-related tips (max 200 words)";
      case ContentType.NATURE_INFO:
        return "Information about natural features, wildlife, or seasonal highlights (max 200 words)";
      case ContentType.FUN_FACT:
        return "Interesting and surprising facts about this location (max 150 words)";
      case ContentType.HISTORICAL_CONTEXT:
        return "Historical background, cultural significance, or heritage information (max 250 words)";
      case ContentType.DESCRIPTION:
        return "General description and information about this place (max 200 words)";
      default:
        return "Relevant information about this place (max 200 words)";
    }
  }

  private getPromptTemplate(poi: POIDocument, contentTypes: ContentType[], themes: string, poiTypes: string): string {
    const contentTypeDescriptions = contentTypes.map(type => {
      const description = CONTENT_TYPE_PROMPT[type as keyof typeof CONTENT_TYPE_PROMPT];
      return `- ${type.replace('_', ' ')}: ${description || 'Relevant information about this place'}`;
    }).join('\n');

    return `
Create engaging content for "${poi.name}" during a ${themes} themed route.

Generate content for the following types: ${contentTypes.join(', ')}

Place details:
- Name: ${poi.name}
- Coordinates: ${poi.locationRegion.latitude}, ${poi.locationRegion.longitude}
- Place types: ${poiTypes}
- Route theme: ${themes}

Content requirements:
${contentTypeDescriptions}

Important instructions:
- Make each piece conversational, informative, and feel like advice from a knowledgeable local friend
- Ensure each content type is distinct and provides unique value
- Keep within the specified word limits for each content type
- Focus on what makes this place special and relevant to the ${themes} theme
- Write in a warm, engaging tone that encourages exploration
- Return ONLY valid JSON without any markdown formatting

Return the content as a JSON object with keys matching the content types: ${contentTypes.join(', ')}
    `;
  }

  private async updateRouteContentStatus(status: ContentGenerationStatus): Promise<void> {
    try {
      await db
        .collection("users")
        .doc(this.userId)
        .collection("routes")
        .doc(this.routeId)
        .update({
          contentGenerationStatus: status,
          updatedAt: Timestamp.now(),
        });
    } catch (error) {
      throw error;
    }
  }
}
