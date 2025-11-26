import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOvertimeCorrectionInput } from './dto/create-correction.input';
import { OvertimeSummary } from './dto/overtime-response.dto';

@Injectable()
export class OvertimeService {
  constructor(private prisma: PrismaService) {}

  private readonly DB_TYPE_MAP: Record<string, string> = {
    Flexi: 'Flexi',
    SCSKCesta: 'SC SK Cesta',
    SCZahranicie: 'SC Zahraničie',
    Neplateny: 'Neplatený nadčas',
  };

  private readonly REVERSE_DB_TYPE_MAP: Record<string, string> = Object.entries(this.DB_TYPE_MAP).reduce(
    (acc, [key, value]) => {
      acc[value] = key;
      return acc;
    },
    {} as Record<string, string>,
  );

  async getOvertimeSummary(employeeId: number, year: number): Promise<OvertimeSummary[]> {
    const startDate = new Date(year, 0, 1); // Jan 1st of the requested year
    
    // We need to sum the 'Nadcas' interval column.
    // Since Prisma doesn't map 'interval' to a JS type, we use raw SQL.
    // PostgreSQL's EXTRACT(EPOCH FROM interval) returns total seconds.
    // We sum these seconds and divide by 3600 to get hours.

    const result: any[] = await this.prisma.$queryRaw`
      SELECT 
        "Typ" as type,
        SUM(EXTRACT(EPOCH FROM "Nadcas")) / 3600.0 as total_hours
      FROM "Nadcasy"
      WHERE "ZamestnanecID" = ${employeeId}
        AND "Datum" >= ${startDate}
      GROUP BY "Typ"
    `;

    // Define the fixed types we expect (based on user requirement)
    const supportedTypes = ['Flexi', 'SCSKCesta', 'SCZahranicie', 'Neplateny'];
    
    // Map results to ensure all types are present (even if 0)
    return supportedTypes.map(typeKey => {
      // Find the DB record that matches the mapped DB Name
      const dbName = this.DB_TYPE_MAP[typeKey];
      const found = result.find(r => r.type === dbName);
      return {
        type: typeKey,
        hours: found ? parseFloat(found.total_hours) : 0.0
      };
    });
  }

  async createOrUpdateCorrection(input: CreateOvertimeCorrectionInput, adminId: string) {
    const { employeeId, date, type, hours, note, isDeduction } = input;
    
    const dbType = this.DB_TYPE_MAP[type];
    if (!dbType) {
        throw new Error(`Invalid overtime type: ${type}`);
    }

    // Format date to YYYY-MM-DD to match @db.Date and avoid timestamp mismatches
    const dateObj = new Date(date);
    const dateString = dateObj.toISOString().split('T')[0];
    const dateCast = new Date(dateString); // Prisma expects Date object for type safety even if we cast it in raw, but let's use string for raw queries carefully or rely on Prisma's serialization of Date for non-raw.
    // Actually, for $executeRaw with ${param}, passing a Date object results in a timestamp string.
    // For a DATE column comparison, Postgres is smart enough usually, but let's be explicit with ::date casting in SQL.
    
    const signedHours = isDeduction ? -Math.abs(hours) : Math.abs(hours);
    const intervalString = `${signedHours} hours`;

    // Check if record exists
    // Prisma findUnique expects the exact composite key. 
    // Since "Datum" is DateTime @db.Date, passing a JS Date with time 00:00:00 usually works.
    // Let's ensure dateCast is midnight UTC or local? Prisma usually handles ISO strings well.
    
    const existingRecord = await this.prisma.nadcasy.findUnique({
        where: {
            ZamestnanecID_Datum_Typ_Odpocet: {
                ZamestnanecID: employeeId,
                Datum: dateCast, 
                Typ: dbType,
                Odpocet: true // We are only looking for corrections (Odpocet=true)
            }
        }
    });

    if (existingRecord) {
        // Update existing record
        // We need to append the note and add the interval
        const newNote = existingRecord.Poznamka 
            ? `${existingRecord.Poznamka}; ${note}` 
            : note;

        // Update using raw SQL because of Interval math
        await this.prisma.$executeRaw`
            UPDATE "Nadcasy"
            SET 
                "Nadcas" = "Nadcas" + ${intervalString}::interval,
                "Poznamka" = ${newNote},
                "Schvalil" = ${BigInt(adminId)}
            WHERE 
                "ZamestnanecID" = ${employeeId} 
                AND "Datum" = ${dateString}::date 
                AND "Typ" = ${dbType} 
                AND "Odpocet" = true
        `;
    } else {
        // Create new record
        // We must use executeRaw or careful insert because Prisma create input for Unsupported is tricky
        // Ideally we can use create if we cast the interval, but create doesn't support raw values easily in the input object for specific fields
        
        // Let's try simple INSERT via ExecuteRaw to be safe with the Interval type
        await this.prisma.$executeRaw`
            INSERT INTO "Nadcasy" ("ZamestnanecID", "Datum", "Nadcas", "Schvalil", "Poznamka", "Typ", "Odpocet")
            VALUES (
                ${employeeId}, 
                ${dateString}::date, 
                ${intervalString}::interval, 
                ${BigInt(adminId)}, 
                ${note}, 
                ${dbType}, 
                true
            )
        `;
    }

    // Cleanup: If value is 0, delete it (as per requirement)
    const checkZero: any[] = await this.prisma.$queryRaw`
        SELECT EXTRACT(EPOCH FROM "Nadcas") as seconds
        FROM "Nadcasy"
        WHERE "ZamestnanecID" = ${employeeId} 
          AND "Datum" = ${dateString}::date 
          AND "Typ" = ${dbType} 
          AND "Odpocet" = true
    `;

    if (checkZero.length > 0 && parseFloat(checkZero[0].seconds) === 0) {
        await this.prisma.nadcasy.delete({
             where: {
                ZamestnanecID_Datum_Typ_Odpocet: {
                    ZamestnanecID: employeeId,
                    Datum: dateCast,
                    Typ: dbType,
                    Odpocet: true
                }
            }
        });
    }

    return true;
  }
}