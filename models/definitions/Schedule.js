const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  dayOfWeek: {
    type: DataTypes.INTEGER, // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    allowNull: false,
    validate: { min: 0, max: 6 },
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  activity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('aktif', 'online', 'ditunda', 'batal'),
    allowNull: false,
    defaultValue: 'aktif',
  },
  pjId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
}, {
  tableName: 'Schedules',
  timestamps: true,
});

module.exports = Schedule;
