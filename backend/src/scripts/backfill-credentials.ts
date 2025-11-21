import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  const DEFAULT_PASSWORD = 'EmsT_2811';

  try {
    console.log('Starting credentials backfill...');
    
    // 1. Fetch all employees
    const employees = await prisma.zamestnanci.findMany({
      include: {
        UserCredentials: true
      }
    });

    console.log(`Found ${employees.length} employees.`);

    const employeesWithoutCredentials = employees.filter(e => !e.UserCredentials);
    console.log(`Found ${employeesWithoutCredentials.length} employees without credentials.`);

    if (employeesWithoutCredentials.length === 0) {
      console.log('All employees already have credentials. Exiting.');
      return;
    }

    // 2. Prepare default password hash
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // 3. Process each employee
    for (const employee of employeesWithoutCredentials) {
      try {
        // Generate username logic (copied from UsernameService)
        const firstName = employee.Meno;
        const lastName = employee.Priezvisko;

        const normalize = (text: string) => {
            return text
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
              .toLowerCase()
              .trim();
        };

        const normalizedFirst = normalize(firstName).split(/\s+/)[0];
        const normalizedLast = normalize(lastName).split(/\s+/)[0];
        
        const baseUsername = `${normalizedFirst}.${normalizedLast}`;
        let username = baseUsername;
        let counter = 0;

        // Check for collisions (including newly created ones in this transaction if we were parallel, 
        // but here we are sequential so we just check DB)
        while (true) {
          const exists = await prisma.userCredentials.findUnique({
            where: { Username: username },
          });

          if (!exists) {
            break;
          }

          counter++;
          username = `${baseUsername}${counter}`;
        }

        console.log(`Creating credentials for ${employee.Meno} ${employee.Priezvisko} -> Username: ${username}`);

        await prisma.userCredentials.create({
          data: {
            ZamestnanecID: employee.ID,
            Username: username,
            PasswordHash: passwordHash,
          }
        });

      } catch (err) {
        console.error(`Failed to create credentials for employee ID ${employee.ID}:`, err);
      }
    }

    console.log('Backfill completed successfully.');

  } catch (e) {
    console.error('Fatal error during backfill:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

