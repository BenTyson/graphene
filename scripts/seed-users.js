import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Team member credentials - YOU WILL PROVIDE THESE
const TEAM_CREDENTIALS = [
  {
    username: 'admin',
    email: 'admin@hgraphene.com',
    password: 'admin123', // CHANGE THIS
    firstName: 'Benjamin',
    lastName: 'Tyson',
    role: 'SUPER_ADMIN'
  }
  // Add your team members here in the format:
  // {
  //   username: 'john_doe',
  //   email: 'john@hgraphene.com', 
  //   password: 'temp_password_123',
  //   firstName: 'John',
  //   lastName: 'Doe',
  //   role: 'TEAM_MEMBER'
  // }
];

async function seedUsers() {
  console.log(`🌱 [${new Date().toISOString()}] SEEDING SCRIPT STARTING`);
  console.log('📍 Current working directory:', process.cwd());
  console.log('📍 Script path:', import.meta.url);
  console.log('📍 Node version:', process.version);
  console.log(`📊 [${new Date().toISOString()}] Team credentials to process: ${TEAM_CREDENTIALS.length}`);

  try {
    console.log(`🔗 [${new Date().toISOString()}] Initializing Prisma client...`);
    console.log('✅ Prisma client initialized successfully');

    console.log(`🔗 [${new Date().toISOString()}] Testing database connection...`);
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    console.log(`👥 [${new Date().toISOString()}] Starting user creation process...`);
    
    for (let i = 0; i < TEAM_CREDENTIALS.length; i++) {
      const userData = TEAM_CREDENTIALS[i];
      console.log(`👤 [${new Date().toISOString()}] Processing user ${i + 1}/${TEAM_CREDENTIALS.length}: ${userData.username}`);
      console.log(`📧 Email: ${userData.email}, Role: ${userData.role}`);

      console.log(`🔐 [${new Date().toISOString()}] Hashing password for ${userData.username}...`);
      const passwordHash = await bcrypt.hash(userData.password, 12);
      console.log(`✅ Password hashed successfully for ${userData.username}`);

      console.log(`🔍 [${new Date().toISOString()}] Checking if user ${userData.username} already exists...`);
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: userData.username },
            { email: userData.email }
          ]
        }
      });

      if (existingUser) {
        console.log(`⚠️ [${new Date().toISOString()}] User ${userData.username} already exists (ID: ${existingUser.id}), skipping...`);
        continue;
      }
      console.log(`✅ User ${userData.username} does not exist, proceeding with creation`);

      console.log(`➕ [${new Date().toISOString()}] Creating user ${userData.username} in database...`);
      const newUser = await prisma.user.create({
        data: {
          username: userData.username.toLowerCase(),
          email: userData.email.toLowerCase(),
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          isActive: true
        }
      });

      console.log(`✅ [${new Date().toISOString()}] Successfully created user: ${userData.username} (ID: ${newUser.id}, Role: ${userData.role})`);
    }

    console.log(`🎉 [${new Date().toISOString()}] USER SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`📊 Final user count check...`);
    const totalUsers = await prisma.user.count();
    console.log(`📊 Total users in database: ${totalUsers}`);

  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] USER SEEDING FAILED!`);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    console.log(`🔌 [${new Date().toISOString()}] Disconnecting from database...`);
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  }
}

// Run the seeding
seedUsers();