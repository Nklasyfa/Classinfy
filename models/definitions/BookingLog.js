const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

/**
 * BookingLog — Audit trail untuk setiap perubahan status Booking.
 * Dipakai oleh State Machine (Negosiasi, Force Override, dll.)
 */
const BookingLog = sequelize.define('BookingLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  bookingId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'FK ke Bookings.id',
  },
  actorId: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID user (Admin/Mahasiswa) yang melakukan aksi',
  },
  actorRole: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Nama role aktor saat aksi dilakukan (Admin, Mahasiswa, dll.)',
  },
  oldStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  newStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Kode aksi: approve, reject, negotiate, respond_accept, respond_reject, force_override, cancel',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Catatan opsional (reason reject, adminNotes nego, force override reason)',
  },
  isForceOverride: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Flag apakah aksi ini adalah Force Override (bypass konflik)',
  },
  changedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'BookingLogs',
  timestamps: false,
});

module.exports = BookingLog;
