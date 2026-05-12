const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Room = sequelize.define('Room', {
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
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  facilities: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('available', 'maintenance'),
    allowNull: false,
    defaultValue: 'available',
  },
}, {
  tableName: 'Rooms',
  timestamps: true,
});

module.exports = Room;
