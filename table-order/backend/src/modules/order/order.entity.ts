import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Store } from '../store/store.entity';
import { TableEntity } from '../table/table.entity';
import { TableSession } from '../table/table-session.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  COMPLETED = 'COMPLETED',
}

@Entity('order')
@Index('idx_order_store_table_session', ['storeId', 'tableId', 'sessionId'])
@Index('idx_order_store_status', ['storeId', 'status'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @Column({ name: 'table_id' })
  tableId: number;

  @Column({ name: 'session_id' })
  sessionId: number;

  @Column({ name: 'order_number', type: 'varchar', length: 20 })
  orderNumber: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'int' })
  totalAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => TableEntity)
  @JoinColumn({ name: 'table_id' })
  table: TableEntity;

  @ManyToOne(() => TableSession)
  @JoinColumn({ name: 'session_id' })
  session: TableSession;
}
