import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './gql-auth.guard';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
    return this.authService.login(loginInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async resetPassword(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('newPassword') newPassword: string,
  ): Promise<boolean> {
    // 1. Check if user exists
    const employee = await this.prisma.zamestnanci.findUnique({
      where: { ID: BigInt(employeeId) },
      include: { UserCredentials: true },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // 2. Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 3. Update or Create credentials
    if (employee.UserCredentials) {
      await this.prisma.userCredentials.update({
        where: { ID: employee.UserCredentials.ID },
        data: { PasswordHash: passwordHash },
      });
    } else {
      // Should not happen if created via new flow, but for legacy support
      // We need a username. Since we don't have UsernameService injected here, we might need to refactor or inject it.
      // For now, assume credentials exist or throw.
      throw new Error('User has no credentials to reset. Please recreate user.');
    }

    return true;
  }
}
