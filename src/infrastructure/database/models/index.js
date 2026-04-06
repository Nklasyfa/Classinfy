const { sequelize, testConnection } = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const Room = require('./Room');
const Schedule = require('./Schedule');
const Booking = require('./Booking');

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

// ==================== Seed Functions ====================

const seedRoles = async () => {
  const defaultRoles = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'Mahasiswa' },
    { id: 3, name: 'Dosen' },
  ];

  for (const role of defaultRoles) {
    await Role.findOrCreate({
      where: { id: role.id },
      defaults: role,
    });
  }
  console.log('✅ Default roles tersedia (Admin, Mahasiswa, Dosen)');
};

module.exports = {
  sequelize,
  testConnection,
  Role,
  User,
  Room,
  Schedule,
  Booking,
  seedRoles,
};
