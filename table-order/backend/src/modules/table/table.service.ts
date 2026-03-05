import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TableEntity } from './table.entity';
import { TableSession, SessionStatus } from './table-session.entity';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { OrderHistory } from '../order/order-history.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(TableEntity)
    private readonly tableRepo: Repository<TableEntity>,
    @InjectRepository(TableSession)
    private readonly sessionRepo: Repository<TableSession>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderHistory)
    private readonly historyRepo: Repository<OrderHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async findAllByStore(storeId: number): Promise<TableEntity[]> {
    return this.tableRepo.find({
      where: { storeId },
      order: { tableNumber: 'ASC' },
      select: ['id', 'storeId', 'tableNumber', 'createdAt'],
    });
  }

  async create(storeId: number, dto: CreateTableDto): Promise<TableEntity> {
    const existing = await this.tableRepo.findOne({
      where: { storeId, tableNumber: dto.tableNumber },
    });
    if (existing) {
      throw new ConflictException(`테이블 ${dto.tableNumber}번이 이미 존재합니다.`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const table = this.tableRepo.create({
      storeId,
      tableNumber: dto.tableNumber,
      password: hashedPassword,
    });
    const saved = await this.tableRepo.save(table);
    const { password, ...result } = saved;
    return result as TableEntity;
  }

  async update(storeId: number, tableId: number, dto: UpdateTableDto): Promise<TableEntity> {
    const table = await this.tableRepo.findOne({
      where: { id: tableId, storeId },
    });
    if (!table) throw new NotFoundException('테이블을 찾을 수 없습니다.');

    if (dto.password) {
      table.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.tableNumber !== undefined) {
      const dup = await this.tableRepo.findOne({
        where: { storeId, tableNumber: dto.tableNumber },
      });
      if (dup && dup.id !== tableId) {
        throw new ConflictException(`테이블 ${dto.tableNumber}번이 이미 존재합니다.`);
      }
      table.tableNumber = dto.tableNumber;
    }

    const saved = await this.tableRepo.save(table);
    const { password, ...result } = saved;
    return result as TableEntity;
  }

  async getCurrentSession(storeId: number, tableId: number): Promise<TableSession | null> {
    return this.sessionRepo.findOne({
      where: { storeId, tableId, status: SessionStatus.ACTIVE },
    });
  }

  async completeSession(storeId: number, tableId: number): Promise<void> {
    const session = await this.sessionRepo.findOne({
      where: { storeId, tableId, status: SessionStatus.ACTIVE },
    });
    if (!session) {
      throw new BadRequestException('활성 세션이 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 세션의 모든 주문 조회
      const orders = await this.orderRepo.find({
        where: { storeId, sessionId: session.id },
        relations: ['items'],
      });

      const now = new Date();

      // OrderHistory로 이동
      for (const order of orders) {
        const history = this.historyRepo.create({
          storeId,
          tableId,
          sessionId: session.id,
          orderNumber: order.orderNumber,
          orderItems: order.items.map((item) => ({
            menuName: item.menuName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.subtotal,
          })),
          totalAmount: order.totalAmount,
          orderedAt: order.createdAt,
          completedAt: now,
        });
        await queryRunner.manager.save(history);
      }

      // 원본 주문 삭제 (OrderItem은 CASCADE)
      if (orders.length > 0) {
        await queryRunner.manager.delete(Order, orders.map((o) => o.id));
      }

      // 세션 완료 처리
      session.status = SessionStatus.COMPLETED;
      session.completedAt = now;
      await queryRunner.manager.save(session);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
