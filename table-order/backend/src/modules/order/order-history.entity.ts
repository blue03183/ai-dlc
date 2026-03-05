import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Store } from '../store/store.entity';
import { Table } from '../table/table.entity';

@Entity('order_history')
@Index('idx_history_store_table_completed', ['storeId', 'tableId', 'completedAt'])
@Index('idx_history_store_completed', ['storeId', 'completedAt'])
export class OrderHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeId: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column()
  tableId: number;

  @ManyToOne(() => Table)
  @JoinColumn({ name: 'tableId' })
  table: Table;

  @Column({ type: 'int' })
  sessionId: number;

  @Column({ type: 'varchar', length: 20 })
  orderNumber: string;

  @Column({ type: 'json' })
  orderItems: Array<{
    menuName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;

  @Column({ type: 'int' })
  totalAmount: number;

  @Column({ type: 'datetime' })
  orderedAt: Date;

  @Column({ type: 'datetime' })
  completedAt: Date;
}
