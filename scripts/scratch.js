require('dotenv').config();
const { User, Role } = require('../models');

async function listUsers() {
  const users = await User.findAll({
    include: [{ model: Role, as: 'role' }]
  });
  console.log('List of users in database:');
  users.forEach(u => {
    console.log(`- Username: ${u.username}, Email: ${u.email}, Role: ${u.role?.name} (id:${u.roleId})`);
  });
}
listUsers().then(() => process.exit(0));
