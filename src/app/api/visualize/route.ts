import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type VisualizeRequestBody = {
  dream?: string;
  style?: string;
};

export async function POST(request: Request) {
  try {
    const { dream, style }: VisualizeRequestBody = await request.json();

    if (!dream || !style) {
      return NextResponse.json(
        { error: "Missing 'dream' or 'style' in request body" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Server misconfiguration: GOOGLE_API_KEY missing" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const oraclePrompt = `You are a quirky, modern-day oracle.
Provide an insightful yet entertaining interpretation of the following dream.
Match the user's chosen style: ${style}.

Guidelines:
- Be evocative and imaginative, but stay coherent and concise (150-220 words).
- Use vivid imagery and metaphor, and tie back to common dream symbolism.
- Offer 2-3 actionable reflections for the dreamer.

Dream description:
"""
${dream}
"""`;

    // 1) Generate analysis text using an available Gemini text model (same SDK)
    const textGen = await ai.models.generateContent({
      model: "gemini-1.5-pro-latest",
      contents: oraclePrompt,
    });
    const textCandidate = textGen.candidates?.[0];
    const textParts: any[] = (textCandidate?.content?.parts as any[]) || [];
    const analysisText = textParts
      .filter((p: any) => typeof p?.text === "string")
      .map((p: any) => p.text)
      .join("\n\n");

    // 2) Generate image using Imagen 4 via @google/genai
    let imageUrl: string | null = null;
    try {
      const imagePrompt = `Create a single detailed illustration in the style of ${style}. The illustration should visualize this dream: ${dream}. Render with cinematic composition, cohesive palette, evocative atmosphere, and high fidelity.`;
      const imgResp: any = await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "16:9",
        },
      });
      const first = imgResp?.generatedImages?.[0]?.image?.imageBytes as string | undefined;
      if (first) {
        imageUrl = `data:image/png;base64,${first}`;
      }
    } catch (e) {
      console.warn("Imagen 4 generation failed; falling back to Unsplash.", e);
    }

    if (!imageUrl) {
      const q = encodeURIComponent(`${style} dream surreal fantasy ${dream?.slice(0, 32) ?? ""}`);
      const sig = Math.floor(Math.random() * 1_000_000_000);
      imageUrl = `https://source.unsplash.com/1600x900/?${q}&sig=${sig}`;
    }

    const res = NextResponse.json({ analysisText, imageUrl });
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return res;
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}


