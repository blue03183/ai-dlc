import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StoreGuard, ApiResponse } from '../../common';

@Controller('stores/:storeId/tables')
@UseGuards(JwtAuthGuard, StoreGuard)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  async findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    const tables = await this.tableService.findAllByStore(storeId);
    return ApiResponse.ok(tables);
  }

  @Post()
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateTableDto,
  ) {
    const table = await this.tableService.create(storeId, dto);
    return ApiResponse.ok(table);
  }

  @Put(':tableId')
  async update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
    @Body() dto: UpdateTableDto,
  ) {
    const table = await this.tableService.update(storeId, tableId, dto);
    return ApiResponse.ok(table);
  }

  @Post(':tableId/complete')
  async completeSession(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
  ) {
    await this.tableService.completeSession(storeId, tableId);
    return ApiResponse.ok({ success: true, completedAt: new Date() });
  }
}
