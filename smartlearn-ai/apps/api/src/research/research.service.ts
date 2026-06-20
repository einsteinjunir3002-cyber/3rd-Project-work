import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResearchService {
  constructor(private prisma: PrismaService) {}

  async findProjectsByPi(piId: string) {
    return this.prisma.researchProject.findMany({
      where: { piId },
      include: {
        tasks: {
          orderBy: { title: 'asc' },
        },
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        ethicsApps: {
          orderBy: { submittedAt: 'desc' },
        },
        publications: {
          orderBy: { publishedAt: 'desc' },
        },
      },
    });
  }

  async findProjectById(id: string, piId: string) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { title: 'asc' },
        },
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
        ethicsApps: {
          orderBy: { submittedAt: 'desc' },
        },
        publications: {
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Research project with ID ${id} not found`);
    }

    if (project.piId !== piId) {
      throw new ForbiddenException('You do not have permission to access this project');
    }

    return project;
  }

  async updateTaskStatus(taskId: string, status: string, piId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    if (task.project.piId !== piId) {
      throw new ForbiddenException('You do not have permission to modify tasks in this project');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
  }

  async createEthicsApplication(projectId: string, piId: string) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.piId !== piId) {
      throw new ForbiddenException('You are not authorized to submit applications for this project');
    }

    return this.prisma.ethicsApplication.create({
      data: {
        projectId,
        status: 'PENDING',
      },
    });
  }

  async findPendingEthicsApplications() {
    return this.prisma.ethicsApplication.findMany({
      where: {
        status: {
          in: ['PENDING', 'UNDER_REVIEW'],
        },
      },
      include: {
        project: {
          include: {
            principalInvestigator: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async reviewEthicsApplication(id: string, status: any, comments: string, reviewerId: string) {
    const app = await this.prisma.ethicsApplication.findUnique({
      where: { id },
    });

    if (!app) {
      throw new NotFoundException(`Ethics application with ID ${id} not found`);
    }

    return this.prisma.ethicsApplication.update({
      where: { id },
      data: {
        status,
        comments,
        reviewerId,
      },
    });
  }

  async createPublication(projectId: string, title: string, journal: string, doi: string, piId: string) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.piId !== piId) {
      throw new ForbiddenException('You are not authorized to log publications for this project');
    }

    return this.prisma.publication.create({
      data: {
        projectId,
        title,
        journal,
        doi,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }
}
