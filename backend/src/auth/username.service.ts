import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsernameService {
  constructor(private readonly prisma: PrismaService) {}

  async generateUsername(firstName: string, lastName: string): Promise<string> {
    // Normalize strings: remove diacritics, convert to lowercase
    const normalizedFirst = this.normalize(firstName).split(/\s+/)[0]; // Take only first part
    const normalizedLast = this.normalize(lastName).split(/\s+/)[0]; // Take only first part
    
    const baseUsername = `${normalizedFirst}.${normalizedLast}`;
    let username = baseUsername;
    let counter = 0;

    while (true) {
      // Check if username exists in DB
      const exists = await this.prisma.userCredentials.findUnique({
        where: { Username: username },
      });

      if (!exists) {
        return username;
      }

      counter++;
      username = `${baseUsername}${counter}`;
    }
  }

  private normalize(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .toLowerCase()
      .trim();
  }
}

