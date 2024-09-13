import { v4 as uuidv4 } from "uuid";

export const mockImageAnalysisData = {
  request_id: uuidv4(),
  type: "sofa",
  brand: "West Elm",
  model: "Hamilton",
  color: "gray",
  dimensions: {
    length: 218,
    width: 94,
    height: 90,
  },
  age: 3,
  condition: "excellent",
};

export const mockPriceEstimationData = {
  request_id: uuidv4(),
  highest_price: 500,
  lowest_price: 300,
  average_price: 400,
  description:
    "The price estimate is based on the furniture's brand (West Elm), good condition, and premium materials. The age and any defects slightly lower the value. This estimate is moderately accurate, considering the specific model and Finnish market trends.",
  sell_probability:
    "There's a 70% chance of selling this item. The average price of 400€ is most likely to attract buyers while still being fair to the seller.",
};

export function getMockImageAnalysis() {
  return { ...mockImageAnalysisData, request_id: uuidv4() };
}

export function getMockPriceEstimation() {
  return { ...mockPriceEstimationData, request_id: uuidv4() };
}
