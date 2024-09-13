import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" }); // uusin ilmeisesti 	gemini-1.5-pro-001 vaihda tarpeen mukaan

// Promptia kannattaa säätää ja muuttaa tarpeen mukaan. Tämä on yksinkertainen esimerkki.
// NYt hinta tulee suoraan Geminin kautta. Liian pitkä propmt ei jaksa lukea. 😁
export async function estimateFurniturePrice(furnitureData) {
  try {
    const requestId = uuidv4();

    const prompt = `
      Request ID: ${requestId}

      Description of the piece of furniture:

      The type of the furniture is ${
        furnitureData.type
      }. The maker of the furniture is ${
      furnitureData.brand
    } and its model is ${furnitureData.model}.
      The color of the furniture is ${
        furnitureData.color
      }. The approximate dimensions are ${JSON.stringify(
      furnitureData.dimensions
    )} in cm. 
      The condition is ${furnitureData.condition}. The age is ${
      furnitureData.age
    } years. The material is ${furnitureData.material}. There are defects: ${
      furnitureData.defects
    }. 

      Provide me with a price estimate for this piece of furniture in the second-hand market, based on this description. 
      Pay close attention to the brand, material, age, condition, and defects. The second-hand market is based in Finland, 
      and the price should align with prices of similar items in Finnish web marketplaces.

      Return 3 prices and 1 description as a JSON object that has the fields highest_price, lowest_price, average_price, description and sell_probability. 
      In the description field, explain the criteria used to estimate the price and how accurate it is. 
      In the sell_probability field, give an estimation of how probable it will sell and which of the 3 prices for it would be most likely to sell.
      Text in those fields should be without new lines. The format of your outputs should stay consistent. 
      Provide this information in JSON string format, which remains consistent across all requests.

      Example response format:
      {
        "request_id": "${requestId}",
        "highest_price": 500,
        "lowest_price": 300,
        "average_price": 400,
        "description": "The price estimate is based on the furniture's brand (West Elm), good condition, and premium materials. The age and any defects slightly lower the value. This estimate is moderately accurate, considering the specific model and Finnish market trends.",
        "sell_probability": "There's a 70% chance of selling this item. The average price of 400€ is most likely to attract buyers while still being fair to the seller."
      }
    `;

    const result = await model.generateContent([{ text: prompt }]);
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
    console.error("An error occurred during price estimation:", error);
    return { error: "An unexpected error occurred during price estimation." };
  }
}

// Tätä voidaan käyttää testaukseen jotta ei kuluteta API kutsuja turhaan
export function getExampleFurnitureFormData() {
  return {
    type: "Dining Table",
    brand: "Artek",
    model: "82B",
    color: "Natural Birch",
    dimensions: {
      length: 150,
      width: 85,
      height: 72,
    },
    age: 5,
    condition: "Good",
    material: "Birch",
    defects: "Minor scratches on the tabletop",
  };
}
