require('dotenv').config();
const { sequelize, Schedule, Room } = require('../models');
async function check() {
  const total = await Schedule.count({ where: { semester: 'Genap 2025/2026' } });
  console.log('Total jadwal di DB:', total);

  const rooms = await Room.findAll({ order: [['code', 'ASC']] });
  for (const r of rooms) {
    const cnt = await Schedule.count({ where: { roomId: r.id, semester: 'Genap 2025/2026' } });
    console.log(' ', r.code.padEnd(30), ':', cnt, 'jadwal');
  }
  await sequelize.close();
}
check().catch(err => { console.error(err.message); process.exit(1); });
