import { estimateFurniturePrice } from "./priceAnalysis.js";

// Parempi olisi käyttää typescriptiä.
async function main() {
  try {
    // Kovakoodattu esimerkki huonekalun tiedoista. Tämä tulisi frontendilta lomakkeesta tai vastaavasta.
    // Ja tämä pitäisi lähettää backendille. Geminille ja sieltä saatu vastaus tulisi lähettää frontendille.

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

    // Näytä kovakoodatut tiedot
    console.log("Kovakoodatut huonekalun tiedot:");
    console.log(JSON.stringify(furnitureData, null, 2));

    // Pyydä hinta-arvio kovakoodattujen tietojen perusteella
    console.log("\nPyydetään hinta-arviota...");
    const priceEstimate = await estimateFurniturePrice(furnitureData);
    console.log("Hinta-arvio:");
    console.log(JSON.stringify(priceEstimate, null, 2));
  } catch (error) {
    console.error("Virhe:", error);
  }
}

main();
