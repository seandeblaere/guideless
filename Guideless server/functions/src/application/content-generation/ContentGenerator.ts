import {db} from "../../index";
import {ContentGenerationStatus} from "../../shared/enums/ContentGenerationStatus";
import {ContentType} from "../../shared/enums/ContentType";
import {IRouteDocument} from "../../domain/interfaces/IRouteDocument";
import {POIDocument} from "../../domain/interfaces/IPOIDocument";
import {apiConfig} from "../../config/ApiConfig";
import {CONTENT_TYPES, CONTENT_TYPE_PROMPT} from "../../shared/constants/ContentTypeConstants";
import {POIContent} from "../../domain/interfaces/IPOIContent";
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

  private async generatePOIContent(
    poi: POIDocument
  ): Promise<void> {
    try {
      if (poi.contentReady || poi.content) {
        return;
      }

      const contentTypes = this.determineContentType(poi.types);
      const generatedText = await this.callGeminiAPI(poi, contentTypes);

      const poiContent: POIContent = {
        contentTypes: contentTypes,
        content: generatedText,
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
      throw error;
    }
  }

  private async callGeminiAPI(poi: POIDocument, contentType: ContentType[]): Promise<string> {
    const prompt = this.buildPrompt(poi, contentType);

    const response = await this.genAI.models.generateContent({
      model: apiConfig.googleGemini.model,
      contents: prompt,
      config: {
        systemInstruction: apiConfig.googleGemini.systemInstruction,
      },
    });

    return response.text;
  }

  private buildPrompt(poi: POIDocument, contentType: ContentType[]): string {
    const themes = this.routeData.themes.join(", ");
    const poiTypes = poi.types?.join(", ");

    return this.getPromptTemplate(poi, contentType, themes, poiTypes);
  }

  private determineContentType(types: string[]): ContentType[] {
    const contentTypes: ContentType[] = [];
    for (const type of types) {
      if (CONTENT_TYPES.food_tip.includes(type)) {
        contentTypes.push(ContentType.FOOD_TIP);
      }
      if (CONTENT_TYPES.historical_context.includes(type)) {
        contentTypes.push(ContentType.HISTORICAL_CONTEXT);
      }
      if (CONTENT_TYPES.story.includes(type)) {
        contentTypes.push(ContentType.STORY);
      }
      if (CONTENT_TYPES.fun_fact.includes(type)) {
        contentTypes.push(ContentType.FUN_FACT);
      }
      if (CONTENT_TYPES.nature_info.includes(type)) {
        contentTypes.push(ContentType.NATURE_INFO);
      }
      if (contentTypes.length === 0) {
        contentTypes.push(ContentType.DESCRIPTION);
      }
    }
    return contentTypes;
  }

  private getPromptTemplate(poi: POIDocument, contentType: ContentType[], themes: string, poiTypes: string): string {
    return `
        Create engaging content for a place called "${poi.name}" during a ${themes} themed route around the area of this place.
        The content should describe the place in a way that is interesting and engaging for the user.
        The place has one or more types, and the content should be written in a way that is relevant to the place and the types.
        Based on the type of place, I have provided a list of content types that are relevant to the place.
        Please choose one or more content types from the list that are most relevant to the place and write the content for the place.
        The content should be written in a way that is easy to understand and follow, in a smooth and natural way.

        Place details:
        - Name: ${poi.name}
        - Coordinates: latitude: ${poi.locationRegion.latitude}, longitude: ${poi.locationRegion.longitude}
        - Type of place: ${poiTypes}
        - Content type: ${contentType.join(", ")}
        - Context: This is part of a walking route around the area of this place focused on ${themes},
        Keep it conversational, informative, and under 300 words. Make it feel like advice from a knowledgeable local friend.

        Content type ideas:
        - Food tip: ${CONTENT_TYPE_PROMPT.food_tip}
        - Historical context: ${CONTENT_TYPE_PROMPT.historical_context}
        - Story: ${CONTENT_TYPE_PROMPT.story}
        - Fun fact: ${CONTENT_TYPE_PROMPT.fun_fact}
        - Nature info: ${CONTENT_TYPE_PROMPT.nature_info}

        `;
  }

  private async updateRouteContentStatus(
    status: ContentGenerationStatus
  ): Promise<void> {
    await db
      .collection("users")
      .doc(this.userId)
      .collection("routes")
      .doc(this.routeId)
      .update({
        contentGenerationStatus: status,
        updatedAt: new Date(),
      });
  }
}
