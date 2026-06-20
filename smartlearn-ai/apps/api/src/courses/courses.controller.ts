import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post('seed')
  async seed() {
    const faculty = await this.coursesService['prisma'].faculty.upsert({
      where: { code: 'FOC' }, update: {}, create: { name: 'Faculty of Computing', code: 'FOC' }
    });
    const department = await this.coursesService['prisma'].department.upsert({
      where: { code: 'CS' }, update: {}, create: { name: 'Computer Science', code: 'CS', facultyId: faculty.id }
    });
    const program = await this.coursesService['prisma'].program.upsert({
      where: { code: 'BSC_CS' }, update: {}, create: { name: 'BSc Computer Science', code: 'BSC_CS', departmentId: department.id }
    });
    return { programId: program.id };
  }

  @Post()
  create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    // Only LECTURERs can create courses (can add role guard later, using req.user.roles)
    return this.coursesService.create(createCourseDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Post(':id/materials')
  addMaterial(@Param('id') courseId: string, @Body() body: { title: string; fileUrl: string }) {
    return this.coursesService.addMaterial(courseId, body.title, body.fileUrl);
  }
}
