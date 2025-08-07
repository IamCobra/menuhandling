# Menu Handling System - PostgreSQL Setup

Dette projekt er blevet opgraderet til at bruge PostgreSQL database i stedet for JSON fil lagring.

## PostgreSQL Installation og Setup

### 1. Installer PostgreSQL
På macOS med Homebrew:
```bash
brew install postgresql
brew services start postgresql
```

På Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

På Windows:
Download og installer fra https://www.postgresql.org/download/windows/

### 2. Opret Database og Bruger
Åbn PostgreSQL shell som superuser:
```bash
sudo -u postgres psql
```

Opret database og bruger:
```sql
CREATE DATABASE menuhandling;
CREATE USER menuuser WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE menuhandling TO menuuser;
\q
```

### 3. Opdater Database Konfiguration
Rediger `backend/database.js` og opdater connection indstillingerne:
```javascript
const pool = new Pool({
  user: 'menuuser',        // eller dit brugernavn
  host: 'localhost',
  database: 'menuhandling',
  password: 'password123', // dit password
  port: 5432,
});
```

### 4. Start Serveren
```bash
cd backend
npm install
node server.js
```

## Funktioner

Systemet understøtter nu:
- ✅ **FK1**: Vis menupunkter fra PostgreSQL database
- ✅ **FK2**: Tilføj nye menupunkter med database persistering
- ✅ **FK3**: Rediger eksisterende menupunkter i database
- ✅ **FK4**: Fjern menupunkter fra database
- ✅ **FK5**: Validering af tomme navne
- ✅ **FK6**: Validering af positive priser
- ✅ **FK7**: Automatisk database persistering

## Database Schema

Systemet opretter automatisk følgende tabel:
```sql
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL
);
```

## Fejlhåndtering

Systemet håndterer følgende fejl:
- Database connection fejl
- Ugyldig data validering
- SQL fejl med brugervenlige beskeder

## Migration fra JSON

Den gamle `menuData.json` fil er ikke længere nødvendig, da alle data nu gemmes i PostgreSQL database.

## 🔒 Security & Git Setup

### Important Files to Keep Private
This project uses `.gitignore` to protect sensitive information:
- `backend/config.js` - Contains database passwords and connection details
- `.env` files - Environment variables
- `node_modules/` - Dependencies (reinstall with `npm install`)

### First Time Setup
```bash
# Copy example config and fill in your values
cp backend/config.example.js backend/config.js
# Edit config.js with your database credentials
```

⚠️ **Never commit `config.js` to git!** It contains sensitive database information.
