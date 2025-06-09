const db = require("../config/db");

async function addProduct(productData) {
  const {
    productName,
    productType,
    serialNumber,
    manufacturer,
    purchaseDate,
    warrantyExpiry,
    notes,
    user_id,
  } = productData;

  const query = `
    INSERT INTO products 
    (serial_number, user_id, product_name, product_type, manufacturer, purchase_date, warranty_expiry, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    serialNumber,
    user_id,
    productName,
    productType,
    manufacturer || null,
    purchaseDate,
    warrantyExpiry,
    notes || null,
  ];

  try {
    await db.execute(query, values);
    return { message: "Product added successfully", serialNumber };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Product with this serial number already exists");
    }
    throw error;
  }
}

async function getSingleProduct(serial_number) {
  const query = `
    SELECT 
      serial_number, product_name, product_type, manufacturer, 
      purchase_date, warranty_expiry, notes 
    FROM products 
    WHERE serial_number = ?
    ORDER BY purchase_date DESC
  `;

  try {
    console.log("🔍 Fetching product with serial number:", serial_number);
    const [rows] = await db.execute(query, [serial_number]);

    if (!rows || rows.length === 0) {
      console.log("⚠️ No product found with the given serial number.");
      return null; // or undefined — but null is clearer
    }

    return rows[0]; // Return the first matching product

  } catch (error) {
    console.log("❌ Error while fetching product:", error.message);
    throw new Error("Failed to fetch product: " + error.message);
  }
}
async function getCustomerProducts(user_id) {
  const query = `
    SELECT 
      serial_number, product_name, product_type, manufacturer, 
      purchase_date, warranty_expiry, notes 
    FROM products 
    WHERE user_id = ?
    ORDER BY purchase_date DESC
  `;

  try {
    console.log("🔍 Fetching products for user_id:", user_id);
    const [rows] = await db.execute(query, [user_id]);

    if (!rows || rows.length === 0) {
      console.log("⚠️ No products found for the given user.");
      return []; // Return an empty array for consistency
    }

    return rows; // Return all matching products

  } catch (error) {
    console.log("❌ Error while fetching customer products:", error.message);
    throw new Error("Failed to fetch products: " + error.message);
  }
}


module.exports = { addProduct, getSingleProduct,getCustomerProducts};
