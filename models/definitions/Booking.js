const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  roomId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  bookingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled', 'needs_negotiation', 'rescheduled'),
    allowNull: false,
    defaultValue: 'pending',
  },
  activityWeight: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1, max: 5 },
    comment: 'Bobot prioritas: 1=rendah (umum), 2=organisasi, 3=UKM, 4=akademik, 5=rektorat',
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan rekomendasi admin untuk negosiasi (ruang/waktu alternatif)',
  },
  forceOverrideReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alasan Force Override oleh Admin (force majeure)',
  },
  isForceOverride: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flag: true jika persetujuan dilakukan dengan bypass konflik',
  },
}, {
  tableName: 'Bookings',
  timestamps: true,
});

module.exports = Booking;
