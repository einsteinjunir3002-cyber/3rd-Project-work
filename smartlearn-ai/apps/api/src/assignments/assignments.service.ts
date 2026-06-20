import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAssignmentDto: CreateAssignmentDto) {
    return this.prisma.assignment.create({
      data: {
        title: createAssignmentDto.title,
        description: createAssignmentDto.description,
        dueDate: new Date(createAssignmentDto.dueDate),
        totalPoints: createAssignmentDto.totalPoints,
        courseId: createAssignmentDto.courseId,
      },
    });
  }

  async getAssignmentsByCourse(courseId: string) {
    return this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        submissions: true, // For instructors to see, or we can filter this at the controller
      },
    });
  }

  async submitAssignment(studentId: string, submitDto: SubmitAssignmentDto) {
    return this.prisma.submission.create({
      data: {
        studentId,
        assignmentId: submitDto.assignmentId,
        fileUrl: submitDto.fileUrl,
      },
    });
  }
}
