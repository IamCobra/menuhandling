const { Pool } = require("pg");

// Try to load config file, fallback to environment variables or defaults
let config;
try {
  config = require("./config.js");
} catch (error) {
  console.log("Config file not found, using environment variables or defaults");
  config = {
    database: {
      user: process.env.DB_USER || "myuser",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME || "mydatabase",
      password: process.env.DB_PASSWORD || "mypassword",
      port: process.env.DB_PORT || 5432,
      ssl: process.env.DB_SSL === "true" || false,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    },
  };
}

// Database connection configuration - Connect to Docker PostgreSQL
const pool = new Pool(config.database);

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL database");
    console.log(`   Host: ${config.database.host}:${config.database.port}`);
    console.log(`   Database: ${config.database.database}`);
    console.log(`   User: ${config.database.user}`);
    client.release();
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL database:");
    console.error(`   Host: ${config.database.host}:${config.database.port}`);
    console.error(`   Error: ${error.message}`);
    return false;
  }
}

// Create the menu_items table if it doesn't exist
async function initializeDatabase() {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Database connection failed");
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL
      );
    `);

    // Check if table is empty and insert default data
    const result = await pool.query("SELECT COUNT(*) FROM menu_items");
    const count = parseInt(result.rows[0].count);

    if (count === 0) {
      await pool.query(`
        INSERT INTO menu_items (name, price) VALUES 
        ('Spaghetti Bolognese', 12.00),
        ('Caesar Salad', 9.00)
      `);
      console.log("Default menu items inserted");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Get all menu items
async function getAllMenuItems() {
  try {
    const result = await pool.query("SELECT * FROM menu_items ORDER BY id");
    return result.rows;
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
}

// Add a new menu item
async function addMenuItem(name, price) {
  try {
    const result = await pool.query(
      "INSERT INTO menu_items (name, price) VALUES ($1, $2) RETURNING *",
      [name, price]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error adding menu item:", error);
    throw error;
  }
}

// Update a menu item
async function updateMenuItem(id, name, price) {
  try {
    const result = await pool.query(
      "UPDATE menu_items SET name = $1, price = $2 WHERE id = $3 RETURNING *",
      [name, price, id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error updating menu item:", error);
    throw error;
  }
}

// Delete a menu item
async function deleteMenuItem(id) {
  try {
    const result = await pool.query(
      "DELETE FROM menu_items WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting menu item:", error);
    throw error;
  }
}

// Graceful shutdown
async function closePool() {
  try {
    await pool.end();
    console.log("Database pool closed");
  } catch (error) {
    console.error("Error closing database pool:", error);
  }
}

module.exports = {
  testConnection,
  initializeDatabase,
  getAllMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  closePool,
};
