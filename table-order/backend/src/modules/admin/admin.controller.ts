import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OwnerGuard } from '../auth/owner.guard';
import { StoreGuard } from '../../common';
import { ApiResponse } from '../../common';

@Controller('stores/:storeId/admins')
@UseGuards(JwtAuthGuard, StoreGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  async findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    const admins = await this.adminService.findAllByStore(storeId);
    return ApiResponse.ok(admins);
  }

  @Post()
  @UseGuards(OwnerGuard)
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateAdminDto,
  ) {
    const admin = await this.adminService.create(storeId, dto);
    return ApiResponse.ok(admin);
  }
}
