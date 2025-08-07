// Database configuration file
// Copy this file to config.js and fill in your actual values
// NEVER commit config.js - it contains sensitive information!

module.exports = {
  // PostgreSQL connection settings
  database: {
    user: 'your_username',        // PostgreSQL brugernavn
    host: 'your_host_ip',         // Database host IP
    database: 'menuhandling',     // Database navn
    password: 'your_password',    // PostgreSQL password
    port: 5432,                   // PostgreSQL port (standard er 5432)
    
    // Optional settings
    ssl: false,                   // true hvis SSL er påkrævet
    connectionTimeoutMillis: 10000, // Connection timeout (10 sek)
    idleTimeoutMillis: 30000,     // Idle timeout (30 sek)
  }
};
