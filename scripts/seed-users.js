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
  console.log('🌱 Seeding users...');

  try {
    for (const userData of TEAM_CREDENTIALS) {
      console.log(`Creating user: ${userData.username}`);

      // Hash the password
      const passwordHash = await bcrypt.hash(userData.password, 12);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: userData.username },
            { email: userData.email }
          ]
        }
      });

      if (existingUser) {
        console.log(`⚠️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Create the user
      await prisma.user.create({
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

      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    console.log('🎉 User seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedUsers();