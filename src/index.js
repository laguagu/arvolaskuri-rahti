import { analyzeFurnitureWithZod } from "./ZodExample.js";
// import { analyzeImage } from "./imageAnalysis.js";
// import { estimateFurniturePrice } from "./priceAnalysis.js";
/*
Yksi vaihtoehto on käyttää Vercel AI SDK:ta https://sdk.vercel.ai/examples/node/generating-structured-data/generate-object
IMO helpoin tapa käyttää strukturoitua outputtia.
*/
async function main() {
  try {
    const imagePath = "./tuoli.jpg";
    console.log(`Analysing image: ${imagePath}`);
    const analyzedImageData = await analyzeFurnitureWithZod(imagePath);
    console.log(
      "Image analysis result:",
      JSON.stringify(analyzedImageData, null, 2)
    );
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
