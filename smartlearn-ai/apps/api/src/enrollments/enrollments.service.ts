import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollDto } from './dto/enroll.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async enroll(userId: string, enrollDto: EnrollDto) {
    // Check if already enrolled
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: enrollDto.courseId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Already enrolled in this course');
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        courseId: enrollDto.courseId,
        status: 'ACTIVE',
      },
      include: {
        course: true,
      },
    });
  }

  async getStudentEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }
}
