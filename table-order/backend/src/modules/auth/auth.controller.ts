import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { TableLoginDto } from './dto/table-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiResponse } from '../../common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  async adminLogin(@Body() dto: AdminLoginDto) {
    const result = await this.authService.adminLogin(
      dto.storeIdentifier,
      dto.username,
      dto.password,
    );
    return ApiResponse.ok(result);
  }

  @Post('table/login')
  async tableLogin(@Body() dto: TableLoginDto) {
    const result = await this.authService.tableLogin(
      dto.storeIdentifier,
      dto.tableNumber,
      dto.password,
    );
    return ApiResponse.ok(result);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    return ApiResponse.ok(req.user);
  }
}
