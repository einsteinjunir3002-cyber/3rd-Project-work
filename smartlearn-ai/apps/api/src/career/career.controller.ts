import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CareerService } from './career.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('career')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Get('mentors')
  async getMentors() {
    return this.careerService.getMentors();
  }

  @Post('mentorship-requests')
  async createRequest(
    @Body('mentorId') mentorId: string,
    @Body('message') message: string,
    @Request() req
  ) {
    return this.careerService.createMentorshipRequest(req.user.userId, mentorId, message);
  }

  @Get('mentorship-requests/student')
  async getStudentRequests(@Request() req) {
    return this.careerService.getStudentRequests(req.user.userId);
  }

  @Get('mentorship-requests/mentor')
  async getMentorRequests(@Request() req) {
    const isMentor = req.user.roles.some((r: string) =>
      ['ALUMNI', 'CAREER_ADVISOR', 'SYSTEM_ADMINISTRATOR'].includes(r)
    );
    if (!isMentor) {
      throw new ForbiddenException('Only mentors can fetch received mentorship requests');
    }
    return this.careerService.getMentorRequests(req.user.userId);
  }

  @Patch('mentorship-requests/:id')
  async updateRequestStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req
  ) {
    const isMentor = req.user.roles.some((r: string) =>
      ['ALUMNI', 'CAREER_ADVISOR', 'SYSTEM_ADMINISTRATOR'].includes(r)
    );
    if (!isMentor) {
      throw new ForbiddenException('Only mentors can update mentorship requests');
    }
    return this.careerService.updateRequestStatus(id, status, req.user.userId);
  }

  @Patch('profile')
  async updateProfile(
    @Body() data: any,
    @Request() req
  ) {
    return this.careerService.updateProfile(req.user.userId, data);
  }
}
