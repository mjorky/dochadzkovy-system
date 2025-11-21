import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Checking for existing admin...');
    const adminExists = await prisma.userCredentials.findFirst({
      where: {
        Zamestnanci: { IsAdmin: true }
      }
    });

    if (adminExists) {
      console.log('Admin already exists.');
      return;
    }

    // Check if we have an employee to promote, or create one
    let adminEmployee = await prisma.zamestnanci.findFirst({
      where: { IsAdmin: true }
    });

    if (!adminEmployee) {
      console.log('No admin employee found. Creating one...');
      // Create admin employee
      // We need a valid TypZamestnanca
      const type = await prisma.zamestnanecTyp.findFirst();
      if (!type) throw new Error('No employee types found');

      adminEmployee = await prisma.zamestnanci.create({
        data: {
          Meno: 'Admin',
          Priezvisko: 'User',
          TypZamestnanca: type.Typ,
          IsAdmin: true,
          Dovolenka: 25
        }
      });
      
      // We also need the t_ table for them
      // Since this script might run outside nest context, we skip dynamic table creation if not critical for auth testing
      // But it is critical for app to not crash.
      // For simplicity of this seed script, we assume we just need login ability.
    }

    console.log(`Creating credentials for admin ID ${adminEmployee.ID}...`);
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await prisma.userCredentials.upsert({
      where: { ZamestnanecID: adminEmployee.ID },
      update: {},
      create: {
        ZamestnanecID: adminEmployee.ID,
        Username: 'admin.user',
        PasswordHash: passwordHash
      }
    });

    console.log('Admin created: admin.user / admin123');

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

