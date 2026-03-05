import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Store } from '../store/store.entity';

@Entity('admins')
@Index('idx_admin_store_username', ['storeId', 'username'], { unique: true })
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeId: number;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'enum', enum: ['OWNER', 'MANAGER'], default: 'MANAGER' })
  role: 'OWNER' | 'MANAGER';

  @Column({ type: 'int', default: 0 })
  loginAttempts: number;

  @Column({ type: 'datetime', nullable: true })
  lockedUntil: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
