import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CareerService {
  constructor(private prisma: PrismaService) {}

  async getMentors() {
    return this.prisma.user.findMany({
      where: {
        roles: {
          hasSome: ['ALUMNI', 'CAREER_ADVISOR'],
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        graduationYear: true,
        company: true,
        jobTitle: true,
        bio: true,
        skills: true,
        advisorExpertise: true,
      },
    });
  }

  async createMentorshipRequest(studentId: string, mentorId: string, message?: string) {
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${mentorId} not found`);
    }

    const isMentorEligible = mentor.roles.some((r) =>
      ['ALUMNI', 'CAREER_ADVISOR'].includes(r)
    );
    if (!isMentorEligible) {
      throw new ForbiddenException('Target user is not registered as a mentor');
    }

    return this.prisma.mentorshipRequest.create({
      data: {
        studentId,
        mentorId,
        message,
        status: 'PENDING',
      },
    });
  }

  async getStudentRequests(studentId: string) {
    return this.prisma.mentorshipRequest.findMany({
      where: { studentId },
      include: {
        mentor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            company: true,
            jobTitle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMentorRequests(mentorId: string) {
    return this.prisma.mentorshipRequest.findMany({
      where: { mentorId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRequestStatus(id: string, status: string, mentorId: string) {
    const request = await this.prisma.mentorshipRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException(`Mentorship request with ID ${id} not found`);
    }

    if (request.mentorId !== mentorId) {
      throw new ForbiddenException('You are not authorized to update this request');
    }

    return this.prisma.mentorshipRequest.update({
      where: { id },
      data: { status },
    });
  }

  async updateProfile(userId: string, data: any) {
    const { graduationYear, company, jobTitle, bio, skills, advisorExpertise } = data;
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        graduationYear: graduationYear !== undefined ? (graduationYear !== null && graduationYear !== "" ? Number(graduationYear) : null) : undefined,
        company: company !== undefined ? company : undefined,
        jobTitle: jobTitle !== undefined ? jobTitle : undefined,
        bio: bio !== undefined ? bio : undefined,
        skills: skills !== undefined ? (Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()).filter(Boolean)) : undefined,
        advisorExpertise: advisorExpertise !== undefined ? advisorExpertise : undefined,
      },
    });
  }
}
