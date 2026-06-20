import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ResearchService } from './research.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('research')
export class ResearchController {
  constructor(private readonly researchService: ResearchService) {}

  @Get('projects')
  async getProjects(@Request() req) {
    return this.researchService.findProjectsByPi(req.user.userId);
  }

  @Get('projects/:id')
  async getProjectById(@Param('id') id: string, @Request() req) {
    return this.researchService.findProjectById(id, req.user.userId);
  }

  @Patch('tasks/:taskId/status')
  async updateTaskStatus(
    @Param('taskId') taskId: string,
    @Body('status') status: string,
    @Request() req
  ) {
    return this.researchService.updateTaskStatus(taskId, status, req.user.userId);
  }

  @Post('projects/:projectId/ethics')
  async createEthicsApplication(
    @Param('projectId') projectId: string,
    @Request() req
  ) {
    return this.researchService.createEthicsApplication(projectId, req.user.userId);
  }

  @Get('ethics/pending')
  async getPendingEthics(@Request() req) {
    // Basic role check: must be ETHICS_COMMITTEE_MEMBER, SUPERVISOR, or SYSTEM_ADMINISTRATOR
    const hasRole = req.user.roles.some((r: string) =>
      ['ETHICS_COMMITTEE_MEMBER', 'SUPERVISOR', 'SYSTEM_ADMINISTRATOR'].includes(r)
    );
    if (!hasRole) {
      throw new ForbiddenException('Not authorized to review ethics applications');
    }
    return this.researchService.findPendingEthicsApplications();
  }

  @Patch('ethics/:id/review')
  async reviewEthics(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('comments') comments: string,
    @Request() req
  ) {
    const hasRole = req.user.roles.some((r: string) =>
      ['ETHICS_COMMITTEE_MEMBER', 'SUPERVISOR', 'SYSTEM_ADMINISTRATOR'].includes(r)
    );
    if (!hasRole) {
      throw new ForbiddenException('Not authorized to review ethics applications');
    }
    return this.researchService.reviewEthicsApplication(id, status, comments, req.user.userId);
  }

  @Post('projects/:projectId/publications')
  async createPublication(
    @Param('projectId') projectId: string,
    @Body('title') title: string,
    @Body('journal') journal: string,
    @Body('doi') doi: string,
    @Request() req
  ) {
    return this.researchService.createPublication(projectId, title, journal, doi, req.user.userId);
  }
}
