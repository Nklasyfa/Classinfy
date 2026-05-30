const { sequelize, testConnection } = require('../config/database');
const Role = require('./definitions/Role');
const User = require('./definitions/User');
const Room = require('./definitions/Room');
const Schedule = require('./definitions/Schedule');
const Booking = require('./definitions/Booking');
const ScheduleLog = require('./definitions/ScheduleLog');
const BookingLog = require('./definitions/BookingLog');
const Message = require('./definitions/Message');

// ==================== Associations ====================

// Stage 1: Role <-> User
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// Stage 2: Room <-> Schedule
Room.hasMany(Schedule, { foreignKey: 'roomId', as: 'schedules' });
Schedule.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

// Stage 2: Room <-> Booking
Room.hasMany(Booking, { foreignKey: 'roomId', as: 'bookings' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

// Stage 2: User <-> Booking
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Sprint 4: Booking <-> BookingLog (audit trail)
Booking.hasMany(BookingLog, { foreignKey: 'bookingId', as: 'logs' });
BookingLog.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });

// Sprint 4: User <-> BookingLog
User.hasMany(BookingLog, { foreignKey: 'actorId', as: 'bookingLogs' });
BookingLog.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

// Stage 5: Schedule <-> ScheduleLog
Schedule.hasMany(ScheduleLog, { foreignKey: 'scheduleId', as: 'logs' });
ScheduleLog.belongsTo(Schedule, { foreignKey: 'scheduleId', as: 'schedule' });

// Stage 5: User <-> ScheduleLog
User.hasMany(ScheduleLog, { foreignKey: 'userId', as: 'scheduleLogs' });
ScheduleLog.belongsTo(User, { foreignKey: 'userId', as: 'changedBy' });

const Prodi = require('./definitions/Prodi');
const Matkul = require('./definitions/Matkul');
const Kelas = require('./definitions/Kelas');

// Stage 6: Prodi <-> Matkul
Prodi.hasMany(Matkul, { foreignKey: 'prodiId', as: 'matkuls' });
Matkul.belongsTo(Prodi, { foreignKey: 'prodiId', as: 'prodi' });

// Stage 6: Prodi <-> Kelas
Prodi.hasMany(Kelas, { foreignKey: 'prodiId', as: 'kelas' });
Kelas.belongsTo(Prodi, { foreignKey: 'prodiId', as: 'prodi' });

// Stage 6: User <-> Prodi, Matkul, Kelas
Prodi.hasMany(User, { foreignKey: 'prodiId', as: 'users' });
User.belongsTo(Prodi, { foreignKey: 'prodiId', as: 'prodi' });

Matkul.hasMany(User, { foreignKey: 'matkulId', as: 'users' });
User.belongsTo(Matkul, { foreignKey: 'matkulId', as: 'matkul' });

Kelas.hasMany(User, { foreignKey: 'kelasId', as: 'users' });
User.belongsTo(Kelas, { foreignKey: 'kelasId', as: 'kelas' });

// Stage 6: User (PJ) <-> Schedule
User.hasMany(Schedule, { foreignKey: 'pjId', as: 'managedSchedules' });
Schedule.belongsTo(User, { foreignKey: 'pjId', as: 'pj' });

// Chat System: User <-> Message
User.hasMany(Message, { foreignKey: 'userId', as: 'userMessages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// ==================== Seed Functions ====================

const seedRoles = async () => {
  const defaultRoles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Mahasiswa' },
    { id: 3, name: 'Dosen' },
    { id: 4, name: 'PJ' },
  ];

  for (const role of defaultRoles) {
    await Role.findOrCreate({
      where: { id: role.id },
      defaults: role,
    });
  }
  console.log('✅ Default roles tersedia (Admin, Mahasiswa, Dosen, PJ)');
};

module.exports = {
  sequelize,
  testConnection,
  Role,
  User,
  Room,
  Schedule,
  Booking,
  ScheduleLog,
  BookingLog,
  Prodi,
  Matkul,
  Kelas,
  Message,
  seedRoles,
};
