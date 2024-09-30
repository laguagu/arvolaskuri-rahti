import dedent from "dedent"; // Kirjasto, jolla voi jakaa template stringin usealle riville
import dotenv from "dotenv";
import fs from "fs/promises";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import sharp from "sharp";
import { z } from "zod";

// Tämä vain esimerkki joka on generoitu suoraan Clauden avulla. Hyvä esimerkki siitä miten promptia voi muokata ja llm mallia ohjeistaa
// Nyt malli palauttaa "Unknown" jos ei tiedä jotain tietoa. Tämän tiedon voi viedä suoraan frontend lomakkeelle vaikka ja jos tieto on "Unknown" niin se voidaan jättää tyhjäksi
const examplePrompt2 = dedent` 
Analyze the furniture in the image and provide the following information:
1. Type: Identify the category of furniture (e.g., chair, table, sofa).
2. Brand: Specify the manufacturer or designer if identifiable. If not certain, use "Unknown".
3. Model: Provide the specific model name or number if visible. If not identifiable, use "Unspecified".
4. Color: Describe the primary color of the furniture.
5. Dimensions: Estimate the length, width, and height in centimeters.
6. Age: Estimate the age of the furniture in years. If uncertain, provide a range or best guess.
7. Condition: Assess the overall state (Excellent, Good, Fair, Poor).

Important notes:
- If you can't determine a specific detail, use "Unknown" for text fields or 0 for numeric fields.
- Provide your best estimate for dimensions and age, even if not certain.
- If no furniture is visible in the image, return an object with an 'error' field explaining this.
- Ensure all text values start with a capital letter.
`;
// Lataa ympäristömuuttujat .env tiedostosta
dotenv.config();

// Alusta OpenAI client API-avaimella
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Määritä käytettävä OpenAI malli
const openaiModel = "gpt-4o-2024-08-06"; // gpt-4o-mini on myös hyvä malli nopea pieni LLM malli https://platform.openai.com/docs/models/gpt-4o

// Määritä Zod-skeema huonekaluanalyysia varten
// .describe() metodit auttavat AI:ta ymmärtämään kentän tarkoituksen
const FurnitureAnalysis = z.object({
  type: z
    .string()
    .describe("The category of furniture (e.g., chair, table, sofa)"),
  brand: z.string().describe("The manufacturer or designer of the furniture"),
  model: z.string().describe("The specific model name or number"),
  color: z.string().describe("The primary color of the furniture"),
  dimensions: z
    .object({
      length: z.number(),
      width: z.number(),
      height: z.number(),
    })
    .describe("Dimensions in centimeters"),
  age: z.number().describe("Estimated age in years"),
  condition: z
    .string()
    .describe(
      "Overall state of the furniture (e.g., Excellent, Good, Fair, Poor)"
    ),
  haagaHelia: z.boolean().describe("Is this furniture from Haaga-Helia?"),
});

export async function analyzeFurnitureWithZod(imagePath) {
  try {
    // Lue kuvatiedosto
    const buffer = await fs.readFile(imagePath);

    // Tarkista kuvan metadata
    const metadata = await sharp(buffer).metadata();

    // Määritä kuvan maksimikoko
    const maxWidth = 1920;
    const maxHeight = 1080;

    // Alusta optimoitu kuva
    let optimizedBuffer = sharp(buffer);

    // Skaalaa kuva tarvittaessa säilyttäen kuvasuhteen
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      optimizedBuffer = optimizedBuffer.resize({
        width: maxWidth,
        height: maxHeight,
        fit: "inside",
        withoutEnlargement: true, // Estä kuvan suurentaminen, jos se on jo pienempi
      });
    }

    // Muunna kuva JPEG-muotoon ja optimoi laatu
    optimizedBuffer = await optimizedBuffer
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();

    // Muunna optimoitu kuva base64-muotoon
    const optimizedBase64 = optimizedBuffer.toString("base64");

    // Määritä analyysiohje AI:lle
    const prompt = dedent`
      Analyze the furniture in the image and provide the requested information.
    `;

    // Lähetä pyyntö OpenAI:lle
    const response = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt, // Vaihda tämä examplePrompt2 jos haluatte käytätä koodin alussa olevaa prompttia
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${optimizedBase64}`,
                detail: "auto", // Kuvan tarkkuus: auto, low tai high
              },
            },
          ],
        },
      ],
      response_format: zodResponseFormat(
        FurnitureAnalysis,
        "furniture_analysis"
      ),
    });

    const furnitureAnalysis = FurnitureAnalysis.parse(
      JSON.parse(response.choices[0].message.content)
    );
    return furnitureAnalysis;
  } catch (error) {
    console.error("Error:", error);
    throw new Error("An error occurred during furniture analysis");
  }
}
