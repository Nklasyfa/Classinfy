const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Kelas = sequelize.define('Kelas', {
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
  prodiId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'Kelas',
  timestamps: true,
});

module.exports = Kelas;
