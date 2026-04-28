require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectDB } = require('../config/db');
const User = require('../models/User');

const SEED_USERS = [
  {
    name: 'Principal Admin',
    email: 'principal@school.com',
    password: 'principal123',
    role: 'PRINCIPAL',
  },
  {
    name: 'Teacher One',
    email: 'teacher1@school.com',
    password: 'teacher123',
    role: 'TEACHER',
  },
  {
    name: 'Teacher Two',
    email: 'teacher2@school.com',
    password: 'teacher123',
    role: 'TEACHER',
  },
];

const seed = async () => {
  console.log('🌱 Starting database seeding...');

  
  await connectDB();

  let created = 0;
  let skipped = 0;

  for (const userData of SEED_USERS) {
    const [user, wasCreated] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: {
        name: userData.name,
        email: userData.email,
        password_hash: await bcrypt.hash(userData.password, 10),
        role: userData.role,
      },
    });

    if (wasCreated) {
      console.log(`  ✅ Created: ${user.role} — ${user.email}`);
      created++;
    } else {
      console.log(`  ⏩ Skipped (already exists): ${user.email}`);
      skipped++;
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`   Created: ${created} | Skipped: ${skipped}`);
  console.log('\nDefault credentials:');
  console.log('  Principal: principal@school.com / principal123');
  console.log('  Teacher 1: teacher1@school.com  / teacher123');
  console.log('  Teacher 2: teacher2@school.com  / teacher123');

  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
