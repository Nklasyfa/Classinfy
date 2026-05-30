const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'The user who owns this chat (Mahasiswa/Dosen)',
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'The actual sender of this message (can be the user or an admin)',
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  tableName: 'Messages',
  timestamps: true,
});

module.exports = Message;
