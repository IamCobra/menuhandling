# Progressive Enhancement Demo

Denne fil viser hvordan applikationen implementerer "Progressive Enhancement" - starter med robust HTML/forms og tilføjer JavaScript som forbedring.

## Test Scenarios

### 1. Med JavaScript Aktiveret (Standard)
- AJAX requests til `/api/menu` endpoints
- Real-time opdateringer uden page reload
- Loading states og smooth transitions
- Success/error messages
- Forbedret brugeroplevelse

### 2. Uden JavaScript (Fallback)
- Standard HTML forms med POST/GET requests
- Page reloads efter hver handling
- URL-baserede error messages
- Fungerer i alle browsere, selv ældre

## Test JavaScript Deaktivering

### Browser Developer Tools
1. Åbn Developer Tools (F12)
2. Gå til Settings/Indstillinger
3. Deaktiver JavaScript
4. Reload siden

### Alternativt: Simuler Network Error
I JavaScript console:
```javascript
// Simulate network failure
window.fetch = function() { 
  return Promise.reject('Network unavailable'); 
};
```

## Automatic Fallback System

Systemet detekterer automatisk:
- JavaScript fejl
- Network connectivity issues  
- API response failures

Og falder tilbage til standard HTML forms.

## Arkitektur

```
Frontend JavaScript (Enhanced)
    ↓ (hvis fejl)
HTML Forms (Robust base)
    ↓
Express.js Backend
    ↓  
PostgreSQL Database
```

## API Endpoints (JavaScript enhanced)

- `GET /api/menu` - Hent menu items som JSON
- `POST /api/menu` - Opret ny menu item  
- `PUT /api/menu/:id` - Opdater menu item
- `DELETE /api/menu/:id` - Slet menu item

## Form Endpoints (HTML fallback)

- `GET /` - Vis menu med forms
- `POST /menu` - Opret ny menu item (redirect)
- `POST /menu/edit` - Opdater menu item (redirect)  
- `POST /menu/delete` - Slet menu item (redirect)

## Fordele ved Progressive Enhancement

✅ **Tilgængelighed** - Fungerer for alle brugere
✅ **Performance** - Hurtigere initial load
✅ **Robusthed** - Graceful degradation  
✅ **SEO** - Søgemaskiner kan crawle content
✅ **Compatibility** - Fungerer i alle browsere
