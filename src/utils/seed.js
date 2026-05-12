require('dotenv').config();
const bcrypt = require('bcrypt');
const { connectDB, sequelize } = require('../config/db');
const User = require('../models/User');
const Content = require('../models/Content');
const ContentSlot = require('../models/ContentSlot');
const ContentSchedule = require('../models/ContentSchedule');
const ContentView = require('../models/ContentView');

const seed = async () => {
  console.log('🚀 Initializing Data Seeder...');
  await connectDB();

  const transaction = await sequelize.transaction();

  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    const domain = process.env.ALLOWED_EMAIL_DOMAIN || 'adaniuni.ac.in';

    const [principal] = await User.findOrCreate({
      where: { email: `principal@${domain}` },
      defaults: { 
        name: 'Principal Admin', 
        email: `principal121@adaniuni.ac.in`,
        password_hash: "Janu", 
        role: 'PRINCIPAL' 
      },
      transaction
    });

    const [teacher] = await User.findOrCreate({
      where: { email: `teacher@${domain}` },
      defaults: { 
        name: 'John Teacher', 
        email: `teacher12@adaniuni.ac.in`,
        password_hash: "Janu@185", 
        role: 'TEACHER' 
      },
      transaction
    });

    const subjects = ['maths', 'science', 'history', 'hindi', 'english'];
    for (const sub of subjects) {
      await ContentSlot.findOrCreate({ where: { subject: sub }, transaction });
    }

    const testContent = [
      {
        title: 'Algebra Fundamentals',
        subject: 'maths',
        status: 'APPROVED',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        start_time: new Date(),
        end_time: new Date(Date.now() + 86400000),
      },
      {
        title: 'Quantum Mechanics Intro',
        subject: 'science',
        status: 'PENDING',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      },
      {
        title: 'The Great War History',
        subject: 'history',
        status: 'APPROVED',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        start_time: new Date(),
        end_time: new Date(Date.now() + 86400000),
      },
      {
        title: 'Hindi Literature',
        subject: 'hindi',
        status: 'REJECTED',
        rejection_reason: 'Incorrect file format used.',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      }
    ];

    for (const item of testContent) {
      const content = await Content.create({
        ...item,
        uploaded_by: teacher.id,
        file_type: 'application/pdf',
        file_size: 1024,
        approved_by: item.status === 'APPROVED' ? principal.id : null,
      }, { transaction });

      const slot = await ContentSlot.findOne({ where: { subject: item.subject }, transaction });
      await ContentSchedule.create({
        content_id: content.id,
        slot_id: slot.id,
        rotation_order: 1,
        duration: 5
      }, { transaction });

      if (item.status === 'APPROVED') {
        const viewCount = Math.floor(Math.random() * 20) + 5;
        const views = Array.from({ length: viewCount }).map(() => ({
          content_id: content.id,
          teacher_id: teacher.id,
          subject: item.subject,
          viewed_at: new Date(Date.now() - Math.floor(Math.random() * 1000000))
        }));
        await ContentView.bulkCreate(views, { transaction });
      }
    }

    await transaction.commit();
    console.log('✅ Seeding successful!');
    console.log(`   Principal: principal@${domain}`);
    console.log(`   Teacher:   teacher@${domain}`);
    console.log('   Password:  password123');
  } catch (err) {
    await transaction.rollback();
    console.error('❌ Seeding failed:', err.message);
  }
  process.exit();
};

seed();
