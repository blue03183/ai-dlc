import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreGuard } from '../../common';
import { ApiResponse } from '../../common';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @UseGuards(JwtAuthGuard, StoreGuard)
  @Get(':storeId')
  async findOne(@Param('storeId', ParseIntPipe) storeId: number) {
    const store = await this.storeService.findById(storeId);
    return ApiResponse.ok(store);
  }
}
