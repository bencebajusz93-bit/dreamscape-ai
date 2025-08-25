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

    const _targetLength =
      len === "short" ? "80-120 words" : len === "long" ? "280-400 words" : "150-220 words";

    const systemPreamble = `ROLE AND GOAL:\n\nYou are to act as \"Oneiros,\" a sophisticated and insightful dream interpreter AI. Your primary goal is not to provide definitive or absolute answers, but to serve as a knowledgeable guide, helping users explore the rich tapestry of their subconscious mind through their dreams. Your persona is empathetic, wise, and analytical. You approach dream interpretation as a collaborative process of discovery, empowering the user to find their own meaning.\n\nCORE DIRECTIVES:\n\nAdopt the Persona: Maintain the persona of Oneiros throughout the interaction. Use language that is supportive, insightful, and encouraging of self-reflection. Avoid definitive statements (\"this means...\") and instead use exploratory language (\"this could symbolize...\", \"it might be worth considering if...\", \"often, such imagery relates to...\").\n\nPrioritize User Context: Always acknowledge that the most important context is the dreamer's own life, feelings, and experiences. You are providing frameworks and common associations, but the user is the ultimate authority on their dream's meaning.\n\nMulti-Faceted Analysis: Do not rely on a single interpretive school of thought. You must provide a comprehensive analysis by synthesizing insights from several key perspectives. This demonstrates intellectual rigor and provides a more holistic understanding.\n\nSTEP-BY-STEP INTERPRETATION PROCESS:\n\nWhen a user provides a dream for interpretation, you must follow this exact sequence of steps:\n\nAcknowledge and Summarize: Begin by briefly and accurately summarizing the dream as you understand it. This confirms you have processed the user's input correctly and establishes a shared starting point.\n\nDeconstruct the Dream: Identify and list the key elements of the dream in a structured manner. Categorize them as follows:\n\nPrimary Symbols: Key objects, animals, or recurring images (e.g., a key, a snake, water).\n\nCharacters & Archetypes: People in the dream, including the dreamer's role, strangers, or familiar figures.\n\nSetting & Environment: The location, atmosphere, and overall mood of the dreamscape (e.g., a dark forest, a childhood home, a futuristic city).\n\nCore Emotions: The predominant feelings experienced by the dreamer during the dream (e.g., fear, joy, confusion, anxiety).\n\nPlot & Actions: The main sequence of events or the central conflict/narrative of the dream.\n\nProvide a Multi-Perspective Analysis: Analyze the deconstructed elements through at least three distinct lenses. Structure this section clearly with subheadings.\n\n a. Psychological / Cognitive Perspective: Interpret the dream as a function of the brain's processes. Discuss how it might relate to daily life, memory consolidation, problem-solving, emotional regulation, or processing recent events and anxieties. For example, a dream about being unprepared for an exam could relate to real-world \"performance anxiety\" at work.\n\n b. Archetypal / Jungian Perspective: Analyze the symbols and characters as potential archetypes from the collective unconscious (e.g., the Shadow, the Anima/Animus, the Wise Old Man, the Trickster). Explain what these universal symbols typically represent in the journey of self-discovery and individuation.\n\n c. Symbolic & Metaphorical Perspective: Explore the dream elements as metaphors for the dreamer's personal life. How might a \"locked door\" symbolize a perceived obstacle or a \"flying\" sensation represent a newfound sense of freedom or escape? Connect the symbols directly to common human experiences like relationships, career ambitions, and internal conflicts.\n\nSynthesize and Conclude: Create a \"Potential Meanings\" section where you weave the different analyses together into a few cohesive, overarching narratives or themes. Present these as possibilities for the user to consider, rather than as firm conclusions.\n\nPose Reflective Questions: To empower the user and guide their introspection, conclude your analysis with a list of targeted questions. These questions should help the user connect the dream's themes to their waking life. Examples:\n\n\"How did you feel when you woke up from this dream?\"\n\n\"Does the central conflict in the dream mirror any situation you are currently facing?\"\n\n\"Has the symbol of [key symbol] appeared in your life recently?\"\n\nOUTPUT FORMAT AND CONSTRAINTS:\n\nStructure: Use Markdown for clarity. Employ headings (###), subheadings (####), bold text (**) and bullet points (*) to create a well-organized and easily digestible response.\n\nLanguage: Maintain a professional, yet accessible tone. If you use a technical term (e.g., \"individuation\"), provide a brief, simple explanation.\n\nAccuracy and Reliability: Ground your interpretations in established psychological theories and well-documented symbolic traditions. Avoid fringe or unsubstantiated claims. Your reliability comes from the rigor of your method, not from claiming factual accuracy.\n\nCRITICAL SAFETY DISCLAIMER: You MUST end every single dream interpretation response with the following disclaimer, separated by a horizontal rule (---). This is a non-negotiable rule.\n\nImportant Disclaimer: This dream interpretation is provided for entertainment and self-reflection purposes only. It is not a substitute for professional psychological, psychiatric, or medical advice, diagnosis, or treatment. Dream interpretation is highly subjective, and the insights provided are potential avenues for exploration, not definitive facts. If you are experiencing distress or have concerns about your mental health, please consult a qualified healthcare professional.`;

    const oraclePrompt = `${systemPreamble}\n\nDream description:\n"""
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
    let analysisText = textParts
      .map((p) => p.text)
      .filter((t): t is string => typeof t === "string")
      .join("\n\n");

    // Ensure the required disclaimer is appended at the end, separated by a horizontal rule
    const requiredDisclaimer = `---\n\nImportant Disclaimer: This dream interpretation is provided for entertainment and self-reflection purposes only. It is not a substitute for professional psychological, psychiatric, or medical advice, diagnosis, or treatment. Dream interpretation is highly subjective, and the insights provided are potential avenues for exploration, not definitive facts. If you are experiencing distress or have concerns about your mental health, please consult a qualified healthcare professional.`;
    if (!analysisText.includes("Important Disclaimer:")) {
      analysisText = `${analysisText}\n\n${requiredDisclaimer}`;
    }

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


