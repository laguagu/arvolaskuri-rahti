import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" }); // uusin ilmeisesti 	gemini-1.5-pro-001

export async function analyzeImage(imagePath) {
  try {
    const imageBytes = fs.readFileSync(imagePath);
    const requestId = uuidv4();

    const prompt = `
      Request ID: ${requestId}

      Analyze the furniture in the image and provide the following information:
      - type
      - brand
      - model
      - color
      - dimensions (as an object with length, width, and height in cm)
      - age (in years)
      - condition

      Respond with a JSON object. Do not include any markdown formatting or explanation. 
      If there's no furniture in the image, respond with an empty object.
    `;

    const imageBase64 = imageBytes.toString("base64");
    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
    ]);
    const response = await result.response;
    const text = response.text();

    // Remove any potential markdown formatting
    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse JSON:", cleanedText);
      return {
        error: "Failed to parse the response from the AI model.",
        raw_response: cleanedText,
      };
    }
  } catch (error) {
    console.error("An error occurred during image analysis:", error);
    return { error: "An unexpected error occurred during image analysis." };
  }
}

// Testi dataa voi kovakoodata palautuksen jotta API:n toimintaa voi testata eikä sitä kuluteta turhaan
export function getExampleFurnitureData() {
  return {
    request_id: uuidv4(),
    type: "Sofa",
    brand: "West Elm",
    model: "Hamilton",
    color: "Gray",
    dimensions: {
      length: 218,
      width: 94,
      height: 90,
    },
    age: 3,
    condition: "Excellent",
  };
}
