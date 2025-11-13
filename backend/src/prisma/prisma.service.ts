import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService?: ConfigService) {
    const databaseUrl = configService?.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined. Please check your .env file.');
    }

    super({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      // Verify connection by running a simple query
      await this.$queryRaw`SELECT 1`;
      this.logger.log('Successfully connected to the database');
    } catch (error) {
      const databaseUrl = this.configService?.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
      this.logger.error('Failed to connect to the database', {
        error: error instanceof Error ? error.message : error,
        databaseUrl: databaseUrl ? `${databaseUrl.split('@')[1] || 'hidden'}` : 'not set',
      });
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from the database');
  }
}
