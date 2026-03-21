import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CompanyInvestigation {
  name: string;
  industry: string;
  water_use_estimate: string;
  carbon_footprint: string;
  data_centers_known: number;
  transparency: "full" | "partial" | "none" | "unknown";
  key_findings: string[];
  summary: string;
  confidence: "high" | "medium" | "low";
  sources: string[];
  caveats: string;
}

export async function investigateCompany(companyName: string): Promise<CompanyInvestigation | null> {
  const model = "gemini-3.1-pro-preview";
  
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Official company name" },
      industry: { type: Type.STRING, description: "Sector" },
      water_use_estimate: { type: Type.STRING, description: "X gallons/year or unknown" },
      carbon_footprint: { type: Type.STRING, description: "X tons CO2/year" },
      data_centers_known: { type: Type.NUMBER, description: "Number of major data centers" },
      transparency: { 
        type: Type.STRING, 
        enum: ["full", "partial", "none", "unknown"],
        description: "Transparency level"
      },
      key_findings: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Key investigative findings"
      },
      summary: { type: Type.STRING, description: "3 paragraph investigative summary, journalistic tone" },
      confidence: { 
        type: Type.STRING, 
        enum: ["high", "medium", "low"],
        description: "Confidence level"
      },
      sources: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Sources of data"
      },
      caveats: { type: Type.STRING, description: "What data is missing or estimated" }
    },
    required: [
      "name", "industry", "water_use_estimate", "carbon_footprint", 
      "data_centers_known", "transparency", "key_findings", 
      "summary", "confidence", "sources", "caveats"
    ]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Investigate the environmental impact of: "${companyName}". Focus on real data center locations, water usage, and carbon footprint. Use Google Search to find the latest sustainability reports and news.`,
      config: {
        systemInstruction: "You are an environmental investigative analyst specializing in data center sustainability. Use real, verified data from news reports, sustainability filings, and environmental studies.",
        responseMimeType: "application/json",
        responseSchema,
        tools: [{ googleSearch: {} }]
      },
    });

    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Investigation failed:", error);
    return null;
  }
}
