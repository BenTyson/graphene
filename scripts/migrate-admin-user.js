#!/usr/bin/env node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Migration Script: Ensure Admin User has SUPER_ADMIN Role
 *
 * This script ensures that the admin user always has the correct role and permissions
 * after any database schema update. It's safe to run multiple times.
 */

const ADMIN_CONFIG = {
  username: 'admin',
  email: 'admin@hgraphene.com',
  password: 'admin123',
  firstName: 'Benjamin',
  lastName: 'Tyson',
  role: 'SUPER_ADMIN'
};

async function migrateAdminUser() {
  console.log(`🔧 [${new Date().toISOString()}] ADMIN USER MIGRATION STARTING`);
  console.log('📍 Ensuring admin user has proper SUPER_ADMIN permissions...');

  try {
    // Test database connection
    console.log(`🔗 [${new Date().toISOString()}] Testing database connection...`);
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful');

    // Check if admin user exists
    console.log(`🔍 [${new Date().toISOString()}] Looking for admin user...`);
    const existingAdmin = await prisma.user.findUnique({
      where: { username: ADMIN_CONFIG.username }
    });

    if (existingAdmin) {
      console.log(`✅ Admin user found (ID: ${existingAdmin.id})`);
      console.log(`📊 Current role: ${existingAdmin.role}`);
      console.log(`📊 Current name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log(`📊 Current email: ${existingAdmin.email}`);

      // Check if admin needs role upgrade or data update
      const needsRoleUpdate = existingAdmin.role !== ADMIN_CONFIG.role;
      const needsNameUpdate = existingAdmin.firstName !== ADMIN_CONFIG.firstName ||
                             existingAdmin.lastName !== ADMIN_CONFIG.lastName;
      const needsEmailUpdate = existingAdmin.email !== ADMIN_CONFIG.email;

      if (needsRoleUpdate || needsNameUpdate || needsEmailUpdate) {
        console.log(`🔄 [${new Date().toISOString()}] Admin user needs updates:`);
        if (needsRoleUpdate) console.log(`   - Role: ${existingAdmin.role} → ${ADMIN_CONFIG.role}`);
        if (needsNameUpdate) console.log(`   - Name: ${existingAdmin.firstName} ${existingAdmin.lastName} → ${ADMIN_CONFIG.firstName} ${ADMIN_CONFIG.lastName}`);
        if (needsEmailUpdate) console.log(`   - Email: ${existingAdmin.email} → ${ADMIN_CONFIG.email}`);

        const updatedAdmin = await prisma.user.update({
          where: { username: ADMIN_CONFIG.username },
          data: {
            role: ADMIN_CONFIG.role,
            firstName: ADMIN_CONFIG.firstName,
            lastName: ADMIN_CONFIG.lastName,
            email: ADMIN_CONFIG.email,
            isActive: true
          }
        });

        console.log(`✅ [${new Date().toISOString()}] Admin user updated successfully!`);
        console.log(`📊 New role: ${updatedAdmin.role}`);
        console.log(`📊 New name: ${updatedAdmin.firstName} ${updatedAdmin.lastName}`);
      } else {
        console.log(`✅ [${new Date().toISOString()}] Admin user already has correct permissions - no update needed`);
      }

    } else {
      // Admin user doesn't exist - create it
      console.log(`❌ Admin user not found - creating new admin user...`);

      console.log(`🔐 [${new Date().toISOString()}] Hashing admin password...`);
      const passwordHash = await bcrypt.hash(ADMIN_CONFIG.password, 12);

      const newAdmin = await prisma.user.create({
        data: {
          username: ADMIN_CONFIG.username,
          email: ADMIN_CONFIG.email,
          passwordHash,
          firstName: ADMIN_CONFIG.firstName,
          lastName: ADMIN_CONFIG.lastName,
          role: ADMIN_CONFIG.role,
          isActive: true
        }
      });

      console.log(`✅ [${new Date().toISOString()}] Admin user created successfully!`);
      console.log(`📊 New user ID: ${newAdmin.id}`);
      console.log(`📊 Role: ${newAdmin.role}`);
      console.log(`📊 Name: ${newAdmin.firstName} ${newAdmin.lastName}`);
    }

    // Final verification
    console.log(`🔍 [${new Date().toISOString()}] Final verification...`);
    const finalAdmin = await prisma.user.findUnique({
      where: { username: ADMIN_CONFIG.username },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    console.log(`🎉 [${new Date().toISOString()}] ADMIN MIGRATION COMPLETED SUCCESSFULLY!`);
    console.log(`📊 Final admin user state:`);
    console.log(`   - ID: ${finalAdmin.id}`);
    console.log(`   - Username: ${finalAdmin.username}`);
    console.log(`   - Email: ${finalAdmin.email}`);
    console.log(`   - Name: ${finalAdmin.firstName} ${finalAdmin.lastName}`);
    console.log(`   - Role: ${finalAdmin.role}`);
    console.log(`   - Active: ${finalAdmin.isActive}`);

    if (finalAdmin.role === 'SUPER_ADMIN') {
      console.log(`✅ VERIFIED: Admin user has SUPER_ADMIN permissions - User Management will be accessible`);
    } else {
      throw new Error(`❌ VERIFICATION FAILED: Admin user role is ${finalAdmin.role}, expected SUPER_ADMIN`);
    }

  } catch (error) {
    console.error(`❌ [${new Date().toISOString()}] ADMIN MIGRATION FAILED!`);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  } finally {
    console.log(`🔌 [${new Date().toISOString()}] Disconnecting from database...`);
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  }
}

// Only run if this script is being executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAdminUser()
    .then(() => {
      console.log('🎯 Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('🚨 Migration failed:', error);
      process.exit(1);
    });
}

export { migrateAdminUser };