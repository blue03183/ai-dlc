import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderHistory } from './order-history.entity';
import { Menu } from '../menu/menu.entity';
import { TableSession } from '../table/table-session.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { EventModule } from '../event/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, OrderHistory, Menu, TableSession]),
    EventModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
