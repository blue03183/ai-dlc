import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderHistory } from './order-history.entity';
import { Menu } from '../menu/menu.entity';
import { TableSession } from '../table/table-session.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(OrderHistory) private readonly historyRepo: Repository<OrderHistory>,
    @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
    @InjectRepository(TableSession) private readonly sessionRepo: Repository<TableSession>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    storeId: number,
    tableId: number,
    items: Array<{ menuId: number; quantity: number }>,
  ): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      const orderItems: Partial<OrderItem>[] = [];
      let totalAmount = 0;

      for (const item of items) {
        const menu = await manager.findOne(Menu, {
          where: { id: item.menuId, storeId, isAvailable: true },
        });
        if (!menu) {
          throw new BadRequestException(
            `메뉴 ID ${item.menuId}를 찾을 수 없거나 판매 중지 상태입니다.`,
          );
        }
        const subtotal = menu.price * item.quantity;
        totalAmount += subtotal;
        orderItems.push({
          menuId: menu.id,
          menuName: menu.name,
          unitPrice: menu.price,
          quantity: item.quantity,
          subtotal,
        });
      }

      // 세션 확인 또는 자동 생성 (BR-02-1)
      let session = await manager.findOne(TableSession, {
        where: { tableId, storeId, status: 'ACTIVE' },
      });
      if (!session) {
        session = manager.create(TableSession, { storeId, tableId, status: 'ACTIVE' });
        session = await manager.save(TableSession, session);
      }

      const orderNumber = await this.generateOrderNumber(storeId, manager);

      const order = manager.create(Order, {
        storeId, tableId, sessionId: session.id,
        orderNumber, status: 'PENDING', totalAmount,
      });
      const savedOrder = await manager.save(Order, order);

      const savedItems: OrderItem[] = [];
      for (const oi of orderItems) {
        const orderItem = manager.create(OrderItem, { ...oi, orderId: savedOrder.id });
        savedItems.push(await manager.save(OrderItem, orderItem));
      }
      savedOrder.items = savedItems;
      return savedOrder;
    });
  }

  async findByStore(storeId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { storeId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTableSession(storeId: number, tableId: number): Promise<Order[]> {
    const session = await this.sessionRepo.findOne({
      where: { storeId, tableId, status: 'ACTIVE' },
    });
    if (!session) return [];
    return this.orderRepo.find({
      where: { storeId, tableId, sessionId: session.id },
      relations: ['items'],
      order: { createdAt: 'ASC' },
    });
  }

  async findHistory(
    storeId: number, tableId?: number, startDate?: string, endDate?: string,
  ): Promise<OrderHistory[]> {
    const qb = this.historyRepo.createQueryBuilder('h')
      .where('h.storeId = :storeId', { storeId });
    if (tableId) qb.andWhere('h.tableId = :tableId', { tableId });
    if (startDate) qb.andWhere('h.completedAt >= :startDate', { startDate });
    if (endDate) qb.andWhere('h.completedAt <= :endDate', { endDate });
    return qb.orderBy('h.completedAt', 'DESC').getMany();
  }

  async updateStatus(
    storeId: number, orderId: number,
    newStatus: 'PENDING' | 'PREPARING' | 'COMPLETED',
  ): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId }, relations: ['items'],
    });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');

    const validTransitions: Record<string, string> = {
      PENDING: 'PREPARING',
      PREPARING: 'COMPLETED',
    };
    if (validTransitions[order.status] !== newStatus) {
      throw new BadRequestException(`${order.status}에서 ${newStatus}로 변경할 수 없습니다.`);
    }
    order.status = newStatus;
    return this.orderRepo.save(order);
  }

  async delete(storeId: number, orderId: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, storeId }, relations: ['items'],
    });
    if (!order) throw new NotFoundException('주문을 찾을 수 없습니다.');
    await this.orderRepo.remove(order);
    return order;
  }

  async moveToHistory(storeId: number, tableId: number, sessionId: number): Promise<void> {
    const orders = await this.orderRepo.find({
      where: { storeId, tableId, sessionId }, relations: ['items'],
    });
    const now = new Date();
    const histories = orders.map((order) =>
      this.historyRepo.create({
        storeId, tableId, sessionId: order.sessionId,
        orderNumber: order.orderNumber,
        orderItems: order.items.map((i) => ({
          menuName: i.menuName, quantity: i.quantity,
          unitPrice: i.unitPrice, subtotal: i.subtotal,
        })),
        totalAmount: order.totalAmount,
        orderedAt: order.createdAt, completedAt: now,
      }),
    );
    await this.historyRepo.save(histories);
    await this.orderRepo.remove(orders);
  }

  private async generateOrderNumber(storeId: number, manager?: any): Promise<string> {
    const today = new Date();
    const dateStr = today.getFullYear().toString()
      + (today.getMonth() + 1).toString().padStart(2, '0')
      + today.getDate().toString().padStart(2, '0');
    const repo = manager ? manager.getRepository(Order) : this.orderRepo;
    const count = await repo.createQueryBuilder('o')
      .where('o.storeId = :storeId', { storeId })
      .andWhere('o.orderNumber LIKE :prefix', { prefix: `ORD-${dateStr}-%` })
      .getCount();
    return `ORD-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;
  }
}
