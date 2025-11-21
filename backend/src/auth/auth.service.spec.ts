import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    userCredentials: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(() => 'mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        ID: BigInt(1),
        Username: 'test.user',
        PasswordHash: hashedPassword,
        Zamestnanci: { ID: BigInt(1), IsAdmin: false },
      };

      mockPrismaService.userCredentials.findUnique.mockResolvedValue(user);
      
      const result = await service.login({ username: 'test.user', password });
      
      expect(result).toEqual({
        accessToken: 'mock-token',
        user: { id: '1', username: 'test.user', isAdmin: false },
      });
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const user = {
        ID: BigInt(1),
        Username: 'test.user',
        PasswordHash: await bcrypt.hash('correct-password', 10),
        Zamestnanci: { ID: BigInt(1) },
      };

      mockPrismaService.userCredentials.findUnique.mockResolvedValue(user);

      await expect(service.login({ username: 'test.user', password: 'wrong-password' }))
        .rejects.toThrow('Invalid credentials');
    });
  });
});

