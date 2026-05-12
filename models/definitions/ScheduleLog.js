const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ScheduleLog = sequelize.define('ScheduleLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  scheduleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID user (PJ/Admin) yang melakukan perubahan status',
  },
  oldStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  newStatus: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  changedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ScheduleLogs',
  timestamps: false,
});

module.exports = ScheduleLog;
