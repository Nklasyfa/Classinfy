require('dotenv').config();
const { User, Kelas } = require('../models');

async function fixRias() {
  const kelas2024B = await Kelas.findOne({ where: { name: '2024B' } });
  if (kelas2024B) {
    await User.update({ kelasId: kelas2024B.id }, { where: { username: 'RIAS' } });
    console.log('Fixed RIAS to 2024B!');
  }
}
fixRias().then(() => process.exit(0));
