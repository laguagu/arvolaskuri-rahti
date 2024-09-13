import { analyzeImage } from "./imageAnalysis.js";
import { estimateFurniturePrice } from "./priceAnalysis.js";
/*
Vanhan arvolaskuri projektin esimerkki koodi käännetty node.js versioon suurin piirtein.
TODO: Ketjuttaa analyzeImage ja estimateFurniturePrice funktiot yhteen ja alkaa rakentaa eteenpäin logiikkaa. 
TypeScript olisi nice to have, mutta ei pakollinen.
*/
async function main() {
  try {
    // Käyttäjä voi lähettää FormDatan mukana lomakkeen kenttiä LLM mallille ja lisätä ne propmptiin ja sama vice versa.
    const analyzedImageData = await analyzeImage("./tuoli.jpg");
    console.log("Vastaus geminin kuva analyysista: ", analyzedImageData);
    console.log("----------------------");
    // Kovakoodattu esimerkki huonekalun tiedoista.
    const furnitureData = {
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

    console.log("Huonekalun tiedot:");
    console.log(JSON.stringify(analyzedImageData, null, 2));
    console.log("----------------------");
    // Pyydä hinta-arvio
    console.log("\nPyydetään hinta-arviota...");
    const priceEstimate = await estimateFurniturePrice(analyzedImageData);
    console.log("Hinta-arvio:");
    console.log(JSON.stringify(priceEstimate, null, 2));
    console.log("TODO: Palautetaan hinta-arvio käyttäjälle -->");
  } catch (error) {
    console.error("Virhe:", error);
  }
}

main();
