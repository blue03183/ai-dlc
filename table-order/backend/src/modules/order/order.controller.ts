import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ApiResponse } from '../../common';
import { EventService } from '../event/event.service';

@Controller('stores/:storeId')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly eventService: EventService,
  ) {}

  @Post('orders')
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateOrderDto,
  ) {
    const order = await this.orderService.create(storeId, dto.tableId, dto.items);
    this.eventService.emitOrderCreated(storeId, order);
    return ApiResponse.ok(order);
  }

  @Get('orders')
  async findByStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return ApiResponse.ok(await this.orderService.findByStore(storeId));
  }

  @Get('tables/:tableId/orders')
  async findByTableSession(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
  ) {
    return ApiResponse.ok(await this.orderService.findByTableSession(storeId, tableId));
  }

  @Get('tables/:tableId/orders/history')
  async findHistory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('tableId', ParseIntPipe) tableId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return ApiResponse.ok(await this.orderService.findHistory(storeId, tableId, startDate, endDate));
  }

  @Put('orders/:orderId/status')
  async updateStatus(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateStatus(storeId, orderId, dto.status);
    this.eventService.emitOrderStatusChanged(storeId, order);
    return ApiResponse.ok(order);
  }

  @Delete('orders/:orderId')
  async delete(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('orderId', ParseIntPipe) orderId: number,
  ) {
    const order = await this.orderService.delete(storeId, orderId);
    this.eventService.emitOrderDeleted(storeId, orderId, order.tableId);
    return ApiResponse.ok({ deleted: true });
  }
}
