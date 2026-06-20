import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, instructorId: string) {
    let programId = createCourseDto.programId;
    if (!programId) {
      const program = await this.prisma.program.findFirst();
      if (!program) {
        throw new Error('No programs exist in the database yet. Please run the seed first.');
      }
      programId = program.id;
    }

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        instructorId,
        programId: programId as string,
      },
    });
  }

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        instructor: {
          select: { firstName: true, lastName: true, email: true },
        },
        program: {
          select: { name: true, code: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: { firstName: true, lastName: true, email: true },
        },
        program: true,
        materials: true,
        assignments: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async addMaterial(courseId: string, title: string, fileUrl: string) {
    return this.prisma.courseMaterial.create({
      data: {
        courseId,
        title,
        fileUrl,
      },
    });
  }
}
