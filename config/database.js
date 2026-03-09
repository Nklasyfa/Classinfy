const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
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

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Koneksi ke database PostgreSQL (kampus_db) berhasil!');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error.message);
  }
};

module.exports = { sequelize, testConnection };
