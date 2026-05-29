const { Sequelize } = require('sequelize');
// Force Vercel to bundle pg and pg-hstore
require('pg');
require('pg-hstore');

let sequelize;

try {
  if (process.env.DATABASE_URL) {
    // Production (Supabase/Railway)
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    });
  } else if (process.env.DB_NAME) {
    // Local development
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
      }
    );
  } else {
    console.error("CRITICAL ERROR: DATABASE_URL is not set in Environment Variables!");
    // Pass empty string to force a delayed error instead of instant crash
    sequelize = new Sequelize('postgres://dummy:dummy@localhost:5432/dummy', { logging: false });
  }
} catch (error) {
  console.error("CRITICAL ERROR initializing Sequelize:", error.message);
  sequelize = new Sequelize('postgres://dummy:dummy@localhost:5432/dummy', { logging: false });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi ke database PostgreSQL (kampus_db) berhasil!');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
  }
};

module.exports = { sequelize, testConnection };
