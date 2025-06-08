function getProductCategoryCode(productType) {
  const productCategoryCodes = {
    tv: "T",
    washingmachine: "W",
    refrigerator: "R",
    ac: "A",
    smartphone: "P",
    laptop: "L",
    tablet: "B",
    desktopcomputer: "D",
    homeappliance: "H",
    other: "X", 
  };

  if (!productType || typeof productType !== "string") {
    return "X";
  }

  const normalizedType = productType.toLowerCase().replace(/\s+/g, "");

  return productCategoryCodes[normalizedType] || "X";
}

module.exports = { getProductCategoryCode };
