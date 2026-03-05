import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';
import { Menu } from '../menu/menu.entity';

@Entity('order_items')
@Index('idx_orderitem_order', ['orderId'])
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  menuId: number;

  @ManyToOne(() => Menu)
  @JoinColumn({ name: 'menuId' })
  menu: Menu;

  @Column({ type: 'varchar', length: 100 })
  menuName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  unitPrice: number;

  @Column({ type: 'int' })
  subtotal: number;
}
