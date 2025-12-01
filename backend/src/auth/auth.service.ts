import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { username, password } = loginInput;

    const credentials = await this.prisma.userCredentials.findUnique({
      where: { Username: username },
      include: { Zamestnanci: true },
    });

    if (!credentials) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      credentials.PasswordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is a manager of any project or has subordinates
    const managedProject = await this.prisma.projects.findFirst({
      where: { Manager: credentials.Zamestnanci.ID },
    });
    
    const hasSubordinates = await this.prisma.zamestnanci.findFirst({
      where: { ManagerID: credentials.Zamestnanci.ID },
    });

    const isManager = !!managedProject || !!hasSubordinates;

    const payload = {
      sub: credentials.Zamestnanci.ID.toString(), // Convert BigInt to string
      username: credentials.Username,
      isAdmin: credentials.Zamestnanci.IsAdmin,
      isManager,
    };

    // Update last login
    await this.prisma.userCredentials.update({
      where: { ID: credentials.ID },
      data: { LastLogin: new Date() },
    });

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: credentials.Zamestnanci.ID.toString(),
        username: credentials.Username,
        isAdmin: credentials.Zamestnanci.IsAdmin,
        isManager,
      },
    };
  }
}

