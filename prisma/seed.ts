import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting seed...');

  const activeStatus = await prisma.statusGlobal.upsert({
    where: {
      code: 'ACTIVE',
    },
    update: {
      name: 'Active',
      description: 'Active status',
      isActive: true,
    },
    create: {
      code: 'ACTIVE',
      name: 'Active',
      description: 'Active status',
      isActive: true,
    },
  });

  const superAdminRole = await prisma.role.upsert({
    where: {
      code: 'SUPER_ADMIN',
    },
    update: {
      name: 'Super Admin',
      description: 'Full system access',
    },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Full system access',
    },
  });

  const hashedPassword = await bcrypt.hash('123456', 10);

  const adminUser = await prisma.user.upsert({
    where: {
      email: 'admin@belux.com',
    },
    update: {
      firstName: 'Super',
      lastName: 'Admin',
      password: hashedPassword,
      statusId: activeStatus.id,
    },
    create: {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@belux.com',
      password: hashedPassword,
      statusId: activeStatus.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
