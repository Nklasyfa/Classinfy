const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Prodi = sequelize.define('Prodi', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'Prodis',
  timestamps: true,
});

module.exports = Prodi;
