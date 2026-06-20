import { Controller, Get, Patch, Body, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  private checkAdmin(req: any) {
    if (!req.user || !req.user.roles || !req.user.roles.includes('SYSTEM_ADMINISTRATOR')) {
      throw new UnauthorizedException('Access denied. Admin privileges required.');
    }
  }

  @Get('metrics')
  async getMetrics(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getGlobalMetrics();
  }

  @Get('users')
  async getUsers(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/role')
  async updateUserRoles(
    @Param('id') id: string,
    @Body('roles') roles: string[],
    @Request() req
  ) {
    this.checkAdmin(req);
    return this.adminService.updateUserRoles(id, roles);
  }

  @Get('structure')
  async getStructure(@Request() req) {
    this.checkAdmin(req);
    return this.adminService.getUniversityStructure();
  }
}
