# 🌐 Forbind til Vens PostgreSQL Database

## 📋 Setup Guide

### 1️⃣ **Din Ven Skal Gøre (på sin computer):**

#### Installer og opsæt PostgreSQL:
```bash
# macOS med Homebrew
brew install postgresql
brew services start postgresql

# Ubuntu/Linux
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Opret database og bruger:
```bash
# Log ind i PostgreSQL
sudo -u postgres psql

# Opret database og bruger
CREATE DATABASE menuhandling;
CREATE USER menuuser WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE menuhandling TO menuuser;

# Tillad eksterne forbindelser
ALTER USER menuuser CREATEDB;
\q
```

#### Konfigurer PostgreSQL til at tillade eksterne forbindelser:

**Rediger `postgresql.conf`:**
```bash
# Find config fil location
sudo -u postgres psql -c "SHOW config_file;"

# Rediger filen (brug den viste sti)
sudo nano /etc/postgresql/13/main/postgresql.conf
```

Ændre denne linje:
```
listen_addresses = '*'  # Var: 'localhost'
```

**Rediger `pg_hba.conf`:**
```bash
sudo nano /etc/postgresql/13/main/pg_hba.conf
```

Tilføj denne linje (erstat med dit netværk):
```
host    all             all             192.168.1.0/24          md5
```

#### Genstart PostgreSQL:
```bash
# macOS
brew services restart postgresql

# Ubuntu/Linux
sudo systemctl restart postgresql
```

#### Find IP adresse:
```bash
# macOS/Linux
ifconfig | grep "inet "
# eller
ip addr show
```

### 2️⃣ **Du Skal Gøre (på din computer):**

#### Opret konfigurationsfil:
```bash
cd backend
cp config.example.js config.js
```

#### Rediger `config.js` med vennens oplysninger:
```javascript
module.exports = {
  database: {
    user: 'menuuser',              // Brugernavnet din ven oprettede
    host: '192.168.1.XXX',         // Din vens IP adresse
    database: 'menuhandling',      // Database navn
    password: 'password123',       // Passwordet din ven satte
    port: 5432,                    // Standard PostgreSQL port
    ssl: false,
  }
};
```

#### Test forbindelsen:
```bash
cd backend
node -e "const {testConnection} = require('./database'); testConnection();"
```

#### Start serveren:
```bash
node server.js
```

### 3️⃣ **Troubleshooting:**

#### ❌ Connection refused:
- Tjek at PostgreSQL kører på vennens computer
- Tjek firewall indstillinger
- Verificer IP adresse

#### ❌ Authentication failed:
- Tjek brugernavn og password
- Verificer at brugeren har korrekte rettigheder

#### ❌ Database doesn't exist:
- Sørg for at databasen `menuhandling` er oprettet

### 4️⃣ **Netværk Setup:**

#### Samme WiFi netværk:
- Brug lokale IP adresser (192.168.x.x)
- Begge computere skal være på samme netværk

#### Gennem Internet (avanceret):
- Din ven skal opsætte port forwarding (port 5432)
- Brug vennens offentlige IP adresse
- Overvej at bruge SSL (ssl: true)

### 5️⃣ **Sikkerhed:**
- ⚠️ Dette setup er kun til udvikling
- Brug aldrig svage passwords i produktion
- Overvej VPN for sikker forbindelse

## 🚀 Kør Serveren

Efter setup er fuldført:
```bash
cd backend
node server.js
```

Åbn browser: `http://localhost:8080`

## 📞 Support

Hvis I løber ind i problemer:
1. Tjek at begge computere er på samme netværk
2. Test forbindelsen med `ping` kommandoen
3. Verificer PostgreSQL kører: `sudo systemctl status postgresql`
