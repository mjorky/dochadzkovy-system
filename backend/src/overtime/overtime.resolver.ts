import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator'; // Adjust path if needed
import { OvertimeService } from './overtime.service';
import { OvertimeResponse } from './dto/overtime-response.dto';
import { CreateOvertimeCorrectionInput } from './dto/create-correction.input';
import { AuthUser } from '../auth/dto/auth-response';

@Resolver()
@UseGuards(GqlAuthGuard)
export class OvertimeResolver {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Query(() => OvertimeResponse)
  async getOvertimeSummary(
    @Args('employeeId', { type: () => Int }) employeeId: number,
    @Args('year', { type: () => Int }) year: number,
  ): Promise<OvertimeResponse> {
    const items = await this.overtimeService.getOvertimeSummary(employeeId, year);
    return { items };
  }

  @Mutation(() => Boolean)
  async createOvertimeCorrection(
    @Args('input') input: CreateOvertimeCorrectionInput,
    @CurrentUser() user: AuthUser,
  ): Promise<boolean> {
    if (!user.isAdmin && !user.isManager) {
      throw new ForbiddenException('Insufficient permissions');
    }
    
    await this.overtimeService.createOrUpdateCorrection(input, user.id);
    return true;
  }
}
