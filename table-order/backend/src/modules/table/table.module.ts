import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableEntity } from './table.entity';
import { TableSession } from './table-session.entity';
import { TableController } from './table.controller';
import { TableService } from './table.service';
import { AuthModule } from '../auth/auth.module';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { OrderHistory } from '../order/order-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TableEntity,
      TableSession,
      Order,
      OrderItem,
      OrderHistory,
    ]),
    AuthModule,
  ],
  controllers: [TableController],
  providers: [TableService],
  exports: [TableService],
})
export class TableModule {}
