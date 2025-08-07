const db = require('./database.js');

async function testDatabase() {
  try {
    await db.initializeDatabase();
    console.log("✅ Database setup complete!");
    
    // Test adding a menu item
    const newItem = await db.addMenuItem("Test Pizza", 15.99);
    console.log("✅ Added test item:", newItem);
    
    // Get all items
    const items = await db.getAllMenuItems();
    console.log("✅ All menu items:", items);
    
  } catch (error) {
    console.error("❌ Database test failed:", error);
  }
}

testDatabase();
