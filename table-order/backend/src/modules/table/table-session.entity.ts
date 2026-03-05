import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Store } from '../store/store.entity';
import { Table } from './table.entity';

@Entity('table_sessions')
@Index('idx_session_table_status', ['tableId', 'status'])
export class TableSession {
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

  @Column({ type: 'enum', enum: ['ACTIVE', 'COMPLETED'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'COMPLETED';

  @Column({ type: 'datetime', default: () => 'NOW()' })
  startedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null;
}
