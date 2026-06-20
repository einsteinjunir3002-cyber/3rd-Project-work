import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  enroll(@Body() enrollDto: EnrollDto, @Request() req) {
    return this.enrollmentsService.enroll(req.user.userId, enrollDto);
  }

  @Get('my-courses')
  getMyEnrollments(@Request() req) {
    return this.enrollmentsService.getStudentEnrollments(req.user.userId);
  }
}
