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
import { Table } from '../table/table.entity';
import { TableSession } from '../table/table-session.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
@Index('idx_order_store_table_session', ['storeId', 'tableId', 'sessionId'])
@Index('idx_order_store_status', ['storeId', 'status'])
@Index('idx_order_store_created', ['storeId', 'createdAt'])
export class Order {
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

  @Column()
  sessionId: number;

  @ManyToOne(() => TableSession)
  @JoinColumn({ name: 'sessionId' })
  session: TableSession;

  @Column({ type: 'varchar', length: 20 })
  orderNumber: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'PREPARING', 'COMPLETED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';

  @Column({ type: 'int' })
  totalAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
