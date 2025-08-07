const express = require("express");
const path = require("path");
const {
  initializeDatabase,
  getAllMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("./database");

const app = express();
const PORT = 8080;

// Initialize database when server starts
let menuItems = [];

async function initServer() {
  try {
    await initializeDatabase();
    menuItems = await getAllMenuItems();
    console.log("Server initialized with database connection");
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add JSON parsing for API requests
// Serve static files (CSS, etc.) but not index.html
app.use("/static", express.static(path.join(__dirname, "../frontend")));

// Generate HTML with dynamic menu items (HTML-only version)
function generateMenuHTML(errorMessage = null) {
  const menuItemsHTML = menuItems
    .map(
      (item) => `
    <li>
      <span class="menu-item-text">${item.name} - $${item.price}</span>
      <div class="menu-buttons">
        <form action="/menu/edit" method="get" style="display: inline">
          <input type="hidden" name="id" value="${item.id}" />
          <button type="submit">Rediger</button>
        </form>
        <form action="/menu/delete" method="post" style="display: inline">
          <input type="hidden" name="id" value="${item.id}" />
          <button type="submit" class="delete-btn">Fjern</button>
        </form>
      </div>
    </li>
  `
    )
    .join("");

  // Error message display
  const errorDisplay = errorMessage
    ? `
    <div class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-text">${errorMessage}</span>
      <button onclick="this.parentElement.style.display='none'" class="error-close">&times;</button>
    </div>
  `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Menu Handling</title>
    <link rel="stylesheet" href="/static/style.css" />
    <link rel="icon" href="/static/favicon.ico" type="image/x-icon" />
  </head>
  <body>
    <main>
      <h1>Menu Administration</h1>
      ${errorDisplay}
      <section id="menu">
        <h2>Menu</h2>
        <ul>
          ${menuItemsHTML}
        </ul>
        <button class="open-popup-btn" onclick="openAddDialog()">Tilføj ny ret</button>
        
        <!-- Add Dialog -->
        <dialog id="add-popup" class="popup-dialog">
          <div class="popup-content">
            <span class="close-btn" onclick="closeAddDialog()">&times;</span>
            <h3>Tilføj ny ret</h3>
            <form action="/menu" method="post" id="add-form">
              <div class="form-group">
                <label for="add-dish">Navn:</label>
                <input type="text" id="add-dish" name="dish" required />
              </div>
              <div class="form-group">
                <label for="add-price">Pris:</label>
                <input type="text" id="add-price" name="price" required />
              </div>
              <div class="form-buttons">
                <button type="submit">Tilføj</button>
                <button type="button" onclick="closeAddDialog()">Annuller</button>
              </div>
            </form>
          </div>
        </dialog>

        <!-- Edit Dialog -->
        <div id="edit-popup" class="popup-overlay" onclick="if(event.target==this) this.style.display='none'">
          <div class="popup-content">
            <span class="close-btn" onclick="closeEditDialog()">&times;</span>
            <h3>Rediger ret</h3>
            <form action="/menu/edit" method="post" id="edit-form">
              <input type="hidden" id="edit-id" name="id" />
              <div class="form-group">
                <label for="edit-dish">Navn:</label>
                <input type="text" id="edit-dish" name="dish" required />
              </div>
              <div class="form-group">
                <label for="edit-price">Pris:</label>
                <input type="text" id="edit-price" name="price" required />
              </div>
              <div class="form-buttons">
                <button type="submit">Gem ændringer</button>
                <button type="button" onclick="closeEditDialog()">Annuller</button>
              </div>
            </form>
          </div>
        </div>

        <!-- Delete Confirmation Dialog -->
        <div id="delete-popup" class="popup-overlay" onclick="if(event.target==this) this.style.display='none'">
          <div class="popup-content delete-dialog">
            <span class="close-btn" onclick="closeDeleteDialog()">&times;</span>
            <h3>Bekræft sletning</h3>
            <p id="delete-message">Er du sikker på, at du vil fjerne denne ret?</p>
            <form action="/menu/delete" method="post" id="delete-form">
              <input type="hidden" id="delete-id" name="id" />
              <div class="form-buttons">
                <button type="submit" class="delete-confirm">Ja, fjern</button>
                <button type="button" onclick="closeDeleteDialog()">Annuller</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
    
    <script>
      // Progressive Enhancement: JavaScript enhances the form-based functionality
      let jsEnabled = false;
      
      // Test if JavaScript is working and enable enhanced features
      function initializeJavaScript() {
        jsEnabled = true;
        console.log('JavaScript enhancement enabled');
        
        // Add loading states and better UX
        document.body.classList.add('js-enabled');
        
        // Override form submissions with AJAX
        enhanceFormSubmissions();
        
        // Add real-time menu updates
        setupRealTimeUpdates();
      }
      
      // Enhanced form submissions using fetch API
      function enhanceFormSubmissions() {
        // Enhance add form
        const addForm = document.getElementById('add-form');
        if (addForm) {
          addForm.addEventListener('submit', handleAddSubmit);
        }
        
        // Enhance edit form
        const editForm = document.getElementById('edit-form');
        if (editForm) {
          editForm.addEventListener('submit', handleEditSubmit);
        }
        
        // Enhance delete form
        const deleteForm = document.getElementById('delete-form');
        if (deleteForm) {
          deleteForm.addEventListener('submit', handleDeleteSubmit);
        }
      }
      
      // Handle add form submission with AJAX
      async function handleAddSubmit(e) {
        if (!jsEnabled) return; // Fallback to regular form submission
        
        e.preventDefault();
        const formData = new FormData(e.target);
        const dish = formData.get('dish');
        const price = formData.get('price');
        
        try {
          showLoading('Tilføjer ret...');
          const response = await fetch('/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dish, price })
          });
          
          const result = await response.json();
          hideLoading();
          
          if (result.success) {
            closeAddDialog();
            await refreshMenuList();
            showSuccess('Ret tilføjet successfully!');
          } else {
            showError(getErrorMessage(result.error, result.message));
          }
        } catch (error) {
          hideLoading();
          console.error('Add failed, falling back to form submission:', error);
          // Fallback: submit form normally
          jsEnabled = false;
          e.target.submit();
        }
      }
      
      // Handle edit form submission with AJAX  
      async function handleEditSubmit(e) {
        if (!jsEnabled) return; // Fallback to regular form submission
        
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = formData.get('id');
        const dish = formData.get('dish');
        const price = formData.get('price');
        
        try {
          showLoading('Gemmer ændringer...');
          const response = await fetch(\`/api/menu/\${id}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dish, price })
          });
          
          const result = await response.json();
          hideLoading();
          
          if (result.success) {
            closeEditDialog();
            await refreshMenuList();
            showSuccess('Ret opdateret successfully!');
          } else {
            showError(getErrorMessage(result.error, result.message));
          }
        } catch (error) {
          hideLoading();
          console.error('Edit failed, falling back to form submission:', error);
          // Fallback: submit form normally
          jsEnabled = false;
          e.target.submit();
        }
      }
      
      // Handle delete form submission with AJAX
      async function handleDeleteSubmit(e) {
        if (!jsEnabled) return; // Fallback to regular form submission
        
        e.preventDefault();
        const formData = new FormData(e.target);
        const id = formData.get('id');
        
        try {
          showLoading('Fjerner ret...');
          const response = await fetch(\`/api/menu/\${id}\`, {
            method: 'DELETE'
          });
          
          const result = await response.json();
          hideLoading();
          
          if (result.success) {
            closeDeleteDialog();
            await refreshMenuList();
            showSuccess('Ret fjernet successfully!');
          } else {
            showError(getErrorMessage(result.error, result.message));
          }
        } catch (error) {
          hideLoading();
          console.error('Delete failed, falling back to form submission:', error);
          // Fallback: submit form normally
          jsEnabled = false;
          e.target.submit();
        }
      }
      
      // Refresh menu list from server
      async function refreshMenuList() {
        try {
          const response = await fetch('/api/menu');
          const result = await response.json();
          
          if (result.success) {
            updateMenuDisplay(result.menuItems);
          }
        } catch (error) {
          console.error('Failed to refresh menu:', error);
          // Fallback: reload page
          window.location.reload();
        }
      }
      
      // Update menu display with new data
      function updateMenuDisplay(menuItems) {
        const menuList = document.querySelector('#menu ul');
        if (!menuList) return;
        
        menuList.innerHTML = menuItems.map(item => \`
          <li>
            <span class="menu-item-text">\${item.name} - $\${item.price}</span>
            <div class="menu-buttons">
              <button onclick="openEditDialog(\${item.id}, '\${item.name}', '\${item.price}')">Rediger</button>
              <button onclick="openDeleteDialog(\${item.id}, '\${item.name}')" class="delete-btn">Fjern</button>
            </div>
          </li>
        \`).join('');
      }
      
      // Setup real-time updates (could be extended with WebSockets later)
      function setupRealTimeUpdates() {
        // Could implement periodic refresh or WebSocket updates here
        console.log('Real-time updates ready');
      }
      
      // Error message mapping
      function getErrorMessage(errorCode, defaultMessage) {
        const messages = {
          'name_missing': 'Fejl: Navn må ikke være tomt. Indtast venligst et navn på retten.',
          'invalid_price': 'Fejl: Pris skal være et positivt tal. Indtast venligst en gyldig pris.',
          'negative_price': 'Fejl: Pris skal være positiv. Indtast venligst et positivt tal.',
          'database_error': 'Fejl: Der opstod en database fejl. Prøv igen senere.'
        };
        return messages[errorCode] || defaultMessage || 'Der opstod en uventet fejl.';
      }
      
      // Loading state management
      function showLoading(message) {
        // Remove existing loading if any
        hideLoading();
        
        const loading = document.createElement('div');
        loading.id = 'loading-overlay';
        loading.innerHTML = \`
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>\${message}</p>
          </div>
        \`;
        document.body.appendChild(loading);
      }
      
      function hideLoading() {
        const loading = document.getElementById('loading-overlay');
        if (loading) {
          loading.remove();
        }
      }
      
      // Success message
      function showSuccess(message) {
        showMessage(message, 'success');
      }
      
      // Error message
      function showError(message) {
        showMessage(message, 'error');
      }
      
      // Generic message display
      function showMessage(message, type) {
        const existing = document.querySelector('.js-message');
        if (existing) existing.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = \`js-message js-message-\${type}\`;
        messageEl.innerHTML = \`
          <span class="message-text">\${message}</span>
          <button onclick="this.parentElement.remove()" class="message-close">&times;</button>
        \`;
        
        const main = document.querySelector('main');
        main.insertBefore(messageEl, main.firstChild);
        
        // Auto-remove success messages
        if (type === 'success') {
          setTimeout(() => messageEl.remove(), 3000);
        }
      }
      
      // Basic dialog functions (fallback to original functionality)
      function openAddDialog() {
        document.getElementById('add-popup').style.display = 'block';
        document.getElementById('add-dish').focus();
      }
      
      function closeAddDialog() {
        document.getElementById('add-popup').style.display = 'none';
        document.getElementById('add-form').reset();
      }
      
      function openEditDialog(id, name, price) {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-dish').value = name;
        document.getElementById('edit-price').value = price;
        document.getElementById('edit-popup').style.display = 'block';
        document.getElementById('edit-dish').focus();
      }
      
      function closeEditDialog() {
        document.getElementById('edit-popup').style.display = 'none';
        document.getElementById('edit-form').reset();
      }
      
      function openDeleteDialog(id, name) {
        document.getElementById('delete-id').value = id;
        document.getElementById('delete-message').textContent = 
          \`Er du sikker på, at du vil fjerne "\${name}" fra menuen?\`;
        document.getElementById('delete-popup').style.display = 'block';
      }
      
      function closeDeleteDialog() {
        document.getElementById('delete-popup').style.display = 'none';
      }
      
      // Initialize JavaScript enhancements when page loads
      document.addEventListener('DOMContentLoaded', function() {
        initializeJavaScript();
      });
    </script>
  </body>
</html>`;
}

// Generate simple HTML without JavaScript (HTML-only version)
function generateSimpleMenuHTML(errorMessage = null) {
  const menuItemsHTML = menuItems
    .map(
      (item) => `
    <li>
      <span class="menu-item-text">${item.name} - $${item.price}</span>
      <div class="menu-buttons">
        <form action="/menu/edit" method="get" style="display: inline">
          <input type="hidden" name="id" value="${item.id}" />
          <button type="submit">Rediger</button>
        </form>
        <form action="/menu/delete" method="post" style="display: inline">
          <input type="hidden" name="id" value="${item.id}" />
          <button type="submit" class="delete-btn">Fjern</button>
        </form>
      </div>
    </li>
  `
    )
    .join("");

  // Error message display (without JavaScript)
  const errorDisplay = errorMessage
    ? `
    <div class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-text">${errorMessage}</span>
    </div>
  `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Menu Handling</title>
    <link rel="stylesheet" href="/static/style.css" />
    <link rel="icon" href="/static/favicon.ico" type="image/x-icon" />
  </head>
  <body>
    <main>
      <h1>Menu Administration</h1>
      ${errorDisplay}
      <section id="menu">
        <h2>Menu</h2>
        <ul>
          ${menuItemsHTML}
        </ul>
        
        <!-- Add new item toggle and form (pure HTML/CSS) -->
        <div class="add-section">
          <input type="checkbox" id="show-add-form" class="toggle-checkbox" />
          <label for="show-add-form" class="show-add-form-btn">
            Tilføj ny ret
          </label>
          
          <div class="add-form-container">
            <div class="add-form-section">
              <h3>Tilføj ny ret</h3>
              <form action="/menu" method="post">
                <div class="form-group">
                  <label for="dish">Navn:</label>
                  <input type="text" id="dish" name="dish" required />
                </div>
                <div class="form-group">
                  <label for="price">Pris:</label>
                  <input type="text" id="price" name="price" required />
                </div>
                <div class="form-buttons">
                  <button type="submit">Tilføj ret</button>
                  <label for="show-add-form" class="cancel-btn">
                    Annuller
                  </label>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  </body>
</html>`;
}

// Generate HTML with <dialog> elements (HTML-only, no JavaScript required)
function generateEditMenuHTML(errorMessage = null) {
  const menuItemsHTML = menuItems
    .map(
      (item) => `
    <li>
      <span class="menu-item-text">${item.name} - $${item.price}</span>
      <div class="menu-buttons">
        <form action="/menu/edit" method="get" style="display: inline">
          <input type="hidden" name="id" value="${item.id}" />
          <button type="submit">Rediger</button>
        </form>
        <a href="#delete-confirm-${item.id}" class="delete-btn">Fjern</a>
      </div>
    </li>
  `
    )
    .join("");

  // Generate delete confirmation dialogs for each item
  const deleteDialogsHTML = menuItems
    .map(
      (item) => `
    <dialog id="delete-confirm-${item.id}" class="delete-dialog">
      <div class="dialog-content">
        <h3>Bekræft sletning</h3>
        <p>Er du sikker på, at du vil fjerne "${item.name}"?</p>
        <div class="form-buttons">
          <form action="/menu/delete" method="post" style="display: inline">
            <input type="hidden" name="id" value="${item.id}" />
            <button type="submit" class="delete-confirm">Ja, fjern</button>
          </form>
          <a href="/edit-menu" class="cancel-btn">Annuller</a>
        </div>
      </div>
    </dialog>
  `
    )
    .join("");

  // Error message display (without JavaScript)
  const errorDisplay = errorMessage
    ? `
    <div class="error-banner">
      <span class="error-icon">⚠️</span>
      <span class="error-text">${errorMessage}</span>
    </div>
  `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="ie=edge" />
    <title>Menu Handling</title>
    <link rel="stylesheet" href="/static/style.css" />
    <link rel="icon" href="/static/favicon.ico" type="image/x-icon" />
  </head>
  <body>
    <main>
      <h1>Menu Administration</h1>
      ${errorDisplay}
      <section id="menu">
        <h2>Menu</h2>
        <ul>
          ${menuItemsHTML}
        </ul>
        
        <!-- Add new item button and dialog -->
        <div class="add-section">
          <a href="#add-dialog" class="show-add-form-btn">
            Tilføj ny ret
          </a>
          
          <dialog id="add-dialog" class="add-dialog">
            <div class="dialog-content">
              <h3>Tilføj ny ret</h3>
              <form action="/menu" method="post">
                <div class="form-group">
                  <label for="dish">Navn:</label>
                  <input type="text" id="dish" name="dish" required />
                </div>
                <div class="form-group">
                  <label for="price">Pris:</label>
                  <input type="text" id="price" name="price" required />
                </div>
                <div class="form-buttons">
                  <button type="submit">Tilføj ret</button>
                  <a href="/edit-menu" class="cancel-btn">Annuller</a>
                </div>
              </form>
            </div>
          </dialog>
        </div>
        
        <!-- Delete confirmation dialogs -->
        ${deleteDialogsHTML}
      </section>
    </main>
    
    <script>
      // Progressive enhancement: Open dialogs automatically when hash matches
      document.addEventListener('DOMContentLoaded', function() {
        const hash = window.location.hash;
        if (hash) {
          const dialog = document.querySelector(hash);
          if (dialog && dialog.tagName === 'DIALOG') {
            dialog.showModal();
          }
        }
      });
    </script>
  </body>
</html>`;
}

// Serve the main page with dynamic content
app.get("/", async (req, res) => {
  res.redirect("/edit-menu");
});

// Serve the edit-menu page with dynamic content
app.get("/edit-menu", async (req, res) => {
  try {
    // Refresh menu items from database
    menuItems = await getAllMenuItems();

    const { error } = req.query;
    let errorMessage = null;

    if (error === "name_missing") {
      errorMessage =
        "Fejl: Navn må ikke være tomt. Indtast venligst et navn på retten.";
    } else if (error === "invalid_price") {
      errorMessage =
        "Fejl: Pris skal være et positivt tal. Indtast venligst en gyldig pris.";
    } else if (error === "negative_price") {
      errorMessage =
        "Fejl: Pris skal være positiv. Indtast venligst et positivt tal.";
    } else if (error === "database_error") {
      errorMessage = "Fejl: Der opstod en database fejl. Prøv igen senere.";
    } else if (error === "item_not_found") {
      errorMessage = "Fejl: Den ønskede ret blev ikke fundet.";
    }

    res.send(generateEditMenuHTML(errorMessage));
  } catch (error) {
    console.error("Error serving edit-menu page:", error);
    res.redirect("/edit-menu?error=database_error");
  }
});

// Handle adding new menu item
app.post("/menu", async (req, res) => {
  const { dish, price } = req.body;

  try {
    // FK5: Validation - navn må ikke være tomt
    if (!dish || dish.trim() === "") {
      return res.redirect("/edit-menu?error=name_missing");
    }

    // FK6: Validation - pris skal være et positivt tal
    const cleanPrice = price.replace("$", "").trim();
    const priceNumber = parseFloat(cleanPrice);

    if (!cleanPrice || isNaN(priceNumber)) {
      return res.redirect("/edit-menu?error=invalid_price");
    }

    if (priceNumber <= 0) {
      return res.redirect("/edit-menu?error=negative_price");
    }

    await addMenuItem(dish.trim(), priceNumber);
    console.log(`Added: ${dish} - $${cleanPrice}`);
    res.redirect("/edit-menu");
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.redirect("/edit-menu?error=database_error");
  }
});

// Handle editing menu item
app.post("/menu/edit", async (req, res) => {
  const { id, dish, price } = req.body;

  try {
    // FK5: Validation - navn må ikke være tomt
    if (!dish || dish.trim() === "") {
      return res.redirect("/edit-menu?error=name_missing");
    }

    // FK6: Validation - pris skal være et positivt tal
    const cleanPrice = price.replace("$", "").trim();
    const priceNumber = parseFloat(cleanPrice);

    if (!cleanPrice || isNaN(priceNumber)) {
      return res.redirect("/edit-menu?error=invalid_price");
    }

    if (priceNumber <= 0) {
      return res.redirect("/edit-menu?error=negative_price");
    }

    await updateMenuItem(parseInt(id), dish.trim(), priceNumber);
    console.log(`Updated item ${id}: ${dish} - $${cleanPrice}`);
    res.redirect("/edit-menu");
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.redirect("/edit-menu?error=database_error");
  }
});

// Handle deleting menu item
app.post("/menu/delete", async (req, res) => {
  const { id } = req.body;

  try {
    const deletedItem = await deleteMenuItem(parseInt(id));
    if (deletedItem) {
      console.log(`Deleted: ${deletedItem.name}`);
    }
    res.redirect("/edit-menu");
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.redirect("/edit-menu?error=database_error");
  }
});

// GET route for editing menu item (HTML-only version)
app.get("/menu/edit", async (req, res) => {
  const { id } = req.query;
  
  try {
    // Refresh menu items from database
    menuItems = await getAllMenuItems();
    
    // Find the item to edit
    const itemToEdit = menuItems.find(item => item.id === parseInt(id));
    
    if (!itemToEdit) {
      return res.redirect("/edit-menu?error=item_not_found");
    }
    
    // Generate edit page HTML
    const editPageHTML = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rediger ret - Menu Handling</title>
    <link rel="stylesheet" href="/static/style.css" />
  </head>
  <body>
    <main>
      <h1>Rediger ret</h1>
      <div class="edit-form-section">
        <form action="/menu/edit" method="post">
          <input type="hidden" name="id" value="${itemToEdit.id}" />
          <div class="form-group">
            <label for="dish">Navn:</label>
            <input type="text" id="dish" name="dish" value="${itemToEdit.name}" required />
          </div>
          <div class="form-group">
            <label for="price">Pris:</label>
            <input type="text" id="price" name="price" value="${itemToEdit.price}" required />
          </div>
          <div class="form-buttons">
            <button type="submit">Gem ændringer</button>
            <a href="/" class="cancel-link">
              <button type="button">Annuller</button>
            </a>
          </div>
        </form>
      </div>
    </main>
  </body>
</html>`;
    
    res.send(editPageHTML);
  } catch (error) {
    console.error("Error serving edit page:", error);
    res.redirect("/edit-menu?error=database_error");
  }
});

// API endpoints for JavaScript enhanced functionality
// Get all menu items as JSON
app.get("/api/menu", async (req, res) => {
  try {
    const items = await getAllMenuItems();
    res.json({ success: true, menuItems: items });
  } catch (error) {
    console.error("API Error fetching menu items:", error);
    res.status(500).json({ success: false, error: "Database error" });
  }
});

// Add menu item via API
app.post("/api/menu", async (req, res) => {
  const { dish, price } = req.body;

  try {
    // FK5: Validation - navn må ikke være tomt
    if (!dish || dish.trim() === "") {
      return res
        .status(400)
        .json({
          success: false,
          error: "name_missing",
          message: "Navn må ikke være tomt",
        });
    }

    // FK6: Validation - pris skal være et positivt tal
    const cleanPrice =
      typeof price === "string" ? price.replace("$", "").trim() : String(price);
    const priceNumber = parseFloat(cleanPrice);

    if (!cleanPrice || isNaN(priceNumber)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "invalid_price",
          message: "Pris skal være et positivt tal",
        });
    }

    if (priceNumber <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          error: "negative_price",
          message: "Pris skal være positiv",
        });
    }

    const newItem = await addMenuItem(dish.trim(), priceNumber);
    console.log(`API Added: ${dish} - $${cleanPrice}`);
    res.json({ success: true, menuItem: newItem });
  } catch (error) {
    console.error("API Error adding menu item:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "database_error",
        message: "Database fejl",
      });
  }
});

// Update menu item via API
app.put("/api/menu/:id", async (req, res) => {
  const { id } = req.params;
  const { dish, price } = req.body;

  try {
    // FK5: Validation - navn må ikke være tomt
    if (!dish || dish.trim() === "") {
      return res
        .status(400)
        .json({
          success: false,
          error: "name_missing",
          message: "Navn må ikke være tomt",
        });
    }

    // FK6: Validation - pris skal være et positivt tal
    const cleanPrice =
      typeof price === "string" ? price.replace("$", "").trim() : String(price);
    const priceNumber = parseFloat(cleanPrice);

    if (!cleanPrice || isNaN(priceNumber)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "invalid_price",
          message: "Pris skal være et positivt tal",
        });
    }

    if (priceNumber <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          error: "negative_price",
          message: "Pris skal være positiv",
        });
    }

    const updatedItem = await updateMenuItem(
      parseInt(id),
      dish.trim(),
      priceNumber
    );
    console.log(`API Updated item ${id}: ${dish} - $${cleanPrice}`);
    res.json({ success: true, menuItem: updatedItem });
  } catch (error) {
    console.error("API Error updating menu item:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "database_error",
        message: "Database fejl",
      });
  }
});

// Delete menu item via API
app.delete("/api/menu/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await deleteMenuItem(parseInt(id));
    if (deletedItem) {
      console.log(`API Deleted: ${deletedItem.name}`);
      res.json({ success: true, menuItem: deletedItem });
    } else {
      res
        .status(404)
        .json({
          success: false,
          error: "not_found",
          message: "Menu item ikke fundet",
        });
    }
  } catch (error) {
    console.error("API Error deleting menu item:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "database_error",
        message: "Database fejl",
      });
  }
});

// Start server with database initialization
initServer()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(
        "Menu items loaded from database:",
        menuItems.length,
        "items"
      );
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
