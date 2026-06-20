import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessService {
  constructor(private prisma: PrismaService) {}

  // STARTUPS
  async getStartups() {
    return this.prisma.startup.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStartup(data: { name: string; industry: string; description: string; authorName: string }) {
    return this.prisma.startup.create({
      data: {
        name: data.name,
        industry: data.industry,
        description: data.description,
        authorName: data.authorName,
      },
    });
  }

  // JOBS / INTERNSHIPS
  async getJobs() {
    return this.prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJob(data: { title: string; company: string; jobType: "FULL_TIME" | "INTERNSHIP" | "PART_TIME" | "CONTRACT"; description: string }, userRoles: string[]) {
    // Only allow Industry Partners or Admins to post jobs
    if (!userRoles.includes('INDUSTRY_PARTNER') && !userRoles.includes('SYSTEM_ADMINISTRATOR')) {
      throw new UnauthorizedException('Only approved Industry Partners can post jobs.');
    }

    return this.prisma.jobPosting.create({
      data: {
        title: data.title,
        company: data.company,
        jobType: data.jobType,
        description: data.description,
      },
    });
  }
}
