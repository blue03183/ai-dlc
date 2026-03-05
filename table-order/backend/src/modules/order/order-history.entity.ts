import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Store } from '../store/store.entity';
import { TableEntity } from '../table/table.entity';

@Entity('order_history')
@Index('idx_history_store_table_completed', ['storeId', 'tableId', 'completedAt'])
@Index('idx_history_store_completed', ['storeId', 'completedAt'])
export class OrderHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @Column({ name: 'table_id' })
  tableId: number;

  @Column({ name: 'session_id', type: 'int' })
  sessionId: number;

  @Column({ name: 'order_number', type: 'varchar', length: 20 })
  orderNumber: string;

  @Column({ name: 'order_items', type: 'json' })
  orderItems: any;

  @Column({ name: 'total_amount', type: 'int' })
  totalAmount: number;

  @Column({ name: 'ordered_at', type: 'datetime' })
  orderedAt: Date;

  @Column({ name: 'completed_at', type: 'datetime' })
  completedAt: Date;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => TableEntity)
  @JoinColumn({ name: 'table_id' })
  table: TableEntity;
}
