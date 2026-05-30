require('dotenv').config();
const { Schedule } = require('../models');

async function migrate() {
  const count = await Schedule.update(
    { status: 'ditunda' },
    { where: { status: 'aktif' } }
  );
  console.log(`Updated ${count[0]} schedules from aktif to ditunda.`);
}

migrate().then(() => process.exit(0));
