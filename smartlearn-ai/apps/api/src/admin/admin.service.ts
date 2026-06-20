import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getGlobalMetrics() {
    const totalUsers = await this.prisma.user.count();
    const students = await this.prisma.user.count({ where: { roles: { has: 'STUDENT' } } });
    const lecturers = await this.prisma.user.count({ where: { roles: { has: 'LECTURER' } } });
    const researchers = await this.prisma.user.count({ where: { roles: { has: 'RESEARCHER' } } });
    const industryPartners = await this.prisma.user.count({ where: { roles: { has: 'INDUSTRY_PARTNER' } } });
    const startups = await this.prisma.startup.count();
    const departments = await this.prisma.department.count();

    return {
      totalUsers,
      students,
      lecturers,
      researchers,
      industryPartners,
      startups,
      departments,
    };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        roles: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRoles(userId: string, roles: string[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roles: { set: roles as any[] } },
      select: {
        id: true,
        email: true,
        roles: true,
      }
    });
  }

  async getUniversityStructure() {
    return this.prisma.faculty.findMany({
      include: {
        departments: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
