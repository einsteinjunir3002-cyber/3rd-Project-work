import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ResearchModule } from './research/research.module';
import { AdminModule } from './admin/admin.module';
import { BusinessModule } from './business/business.module';
import { CareerModule } from './career/career.module';

@Module({
  imports: [PrismaModule, AuthModule, CoursesModule, EnrollmentsModule, AssignmentsModule, ResearchModule, AdminModule, BusinessModule, CareerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
