import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('business')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('startups')
  getStartups() {
    return this.businessService.getStartups();
  }

  @Post('startups')
  createStartup(
    @Body() body: { name: string; industry: string; description: string; authorName: string }
  ) {
    return this.businessService.createStartup(body);
  }

  @Get('jobs')
  getJobs() {
    return this.businessService.getJobs();
  }

  @Post('jobs')
  createJob(
    @Req() req: any,
    @Body() body: { title: string; company: string; jobType: "FULL_TIME" | "INTERNSHIP" | "PART_TIME" | "CONTRACT"; description: string }
  ) {
    return this.businessService.createJob(body, req.user.roles);
  }
}
