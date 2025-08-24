import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type VisualizeRequestBody = {
  dream?: string;
  style?: string;
  lengthPreference?: "short" | "medium" | "long";
  temperature?: number;
  aspectRatio?: "1:1" | "16:9" | "9:16";
};

export async function POST(request: Request) {
  try {
    const { dream, style, lengthPreference, temperature, aspectRatio }: VisualizeRequestBody = await request.json();

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

    const len = lengthPreference ?? "medium";
    const temp = Math.max(0, Math.min(1, temperature ?? 0.7));
    const ratio = (aspectRatio ?? "16:9") as "1:1" | "16:9" | "9:16";

    const targetLength =
      len === "short" ? "80-120 words" : len === "long" ? "280-400 words" : "150-220 words";

    const systemPreamble = `Persona:\nYou are \"Oneiros\", an empathetic, insightful dream interpreter blending historical symbolism with modern psychology. You guide self-discovery; you do not give diagnoses or definitive answers. Maintain a supportive, curious, non-judgmental tone.\n\nCore directive:\nProvide a comprehensive, multi-faceted analysis that deconstructs the dream and synthesizes perspectives. Frame all interpretations as possibilities. If the description is very brief, gently request more details before full analysis.\n\nConstraints & safeguards:\n- This is subjective interpretation, not clinical advice.\n- Avoid medical or psychiatric guidance.\n- If content is severely distressing, gently suggest considering support from a qualified therapist.\n\nOutput requirements (use Markdown headings/structure exactly as below):\n\nDisclaimer: Please remember, dream interpretation is a subjective art, not an exact science. This analysis offers potential perspectives based on common symbols and psychological theories, but you are the foremost expert on your own inner world. This is for informational and self-exploration purposes only and is not a substitute for professional psychological advice.\n\nDream Interpretation for Your Dream\n1. Dream Synopsis\n- Briefly and objectively summarize the main narrative and sequence of events.\n\n2. Key Symbols & Emotional Landscape\n- Bullet the most prominent symbols/characters/actions. For each, include reported emotions.\n  - Symbol: <symbol>\n  - Emotion: <emotion(s)>\n\n3. Multi-Perspective Analysis\nProvide at least three of the following, each with brief reasoning:\nA. Psychological Lens (Jungian/Archetypal)\nB. Cognitive & Problem-Solving Lens\nC. Emotional Regulation Lens\nD. Cross-Cultural & Symbolic Lens\n\n4. Integrative Synthesis\n- Weave the threads into a holistic perspective using tentative language.\n\n5. Questions for Personal Reflection\n- Provide 3–5 open-ended questions tied to the dream's themes.\n\nTone & style:\n- Supportive, respectful, empowering.\n- Use vivid but clear language.\n- Aim for ${targetLength}.\n- You may borrow subtle metaphorical flavor from the selected visual style (${style}), but keep the persona tone primary.`;

    const oraclePrompt = `${systemPreamble}\n\nAcknowledge and Validate:\n- Begin by acknowledging the user's trust in sharing their dream. If emotions are mentioned, validate them.\n\nIf clarification is necessary:\n- If the description is very brief (e.g., under ~25–30 words), ask for: full narrative, emotions during and after, key elements (people/objects/animals/locations/colors/symbols), and any relevant personal context. Otherwise proceed with the structured analysis.\n\nDream description:\n"""
${dream}
"""`;

    // 1) Generate analysis text using an available Gemini text model (same SDK)
    const textGen = await ai.models.generateContent({
      model: "gemini-1.5-pro-latest",
      contents: oraclePrompt,
      config: { temperature: temp },
    });
    // Safely extract text parts without using `any`
    type TextPart = { text?: string };
    type Candidate = { content?: { parts?: TextPart[] } };
    const textCandidate = (textGen as { candidates?: Candidate[] }).candidates?.[0];
    const textParts: TextPart[] = textCandidate?.content?.parts ?? [];
    const analysisText = textParts
      .map((p) => p.text)
      .filter((t): t is string => typeof t === "string")
      .join("\n\n");

    // 2) Generate image using Imagen 4 via @google/genai
    let imageUrl: string | null = null;
    try {
      const imagePrompt = `Create a single detailed illustration in the style of ${style}. The illustration should visualize this dream: ${dream}. Render with cinematic composition, cohesive palette, evocative atmosphere, and high fidelity.`;
      // Narrow the image response shape to the fields we actually use
      const imgResp = (await ai.models.generateImages({
        model: "imagen-4.0-generate-001",
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: ratio,
        },
      })) as { generatedImages?: Array<{ image?: { imageBytes?: string } }> };
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
      const dims = ratio === "1:1" ? "1200x1200" : ratio === "9:16" ? "900x1600" : "1600x900";
      imageUrl = `https://source.unsplash.com/${dims}/?${q}&sig=${sig}`;
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


