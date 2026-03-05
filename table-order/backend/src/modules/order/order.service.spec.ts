import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrderService } from './order.service';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrderHistory } from './order-history.entity';
import { Menu } from '../menu/menu.entity';
import { TableSession } from '../table/table-session.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockOrderRepo = {
  find: jest.fn(), findOne: jest.fn(), save: jest.fn(), remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};
const mockOrderItemRepo = {};
const mockHistoryRepo = { create: jest.fn(), save: jest.fn(), createQueryBuilder: jest.fn() };
const mockMenuRepo = {};
const mockSessionRepo = { findOne: jest.fn() };
const mockDataSource = { transaction: jest.fn() };

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockOrderItemRepo },
        { provide: getRepositoryToken(OrderHistory), useValue: mockHistoryRepo },
        { provide: getRepositoryToken(Menu), useValue: mockMenuRepo },
        { provide: getRepositoryToken(TableSession), useValue: mockSessionRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<OrderService>(OrderService);
    jest.clearAllMocks();
  });

  describe('findByTableSession', () => {
    it('ACTIVE 세션이 없으면 빈 배열 반환', async () => {
      mockSessionRepo.findOne.mockResolvedValue(null);
      expect(await service.findByTableSession(1, 1)).toEqual([]);
    });
  });

  describe('updateStatus', () => {
    it('PENDING → PREPARING 허용', async () => {
      const order = { id: 1, storeId: 1, status: 'PENDING', items: [] };
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockOrderRepo.save.mockResolvedValue({ ...order, status: 'PREPARING' });
      const result = await service.updateStatus(1, 1, 'PREPARING');
      expect(result.status).toBe('PREPARING');
    });

    it('역방향 전이 거부 (COMPLETED → PREPARING)', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: 1, storeId: 1, status: 'COMPLETED', items: [] });
      await expect(service.updateStatus(1, 1, 'PREPARING')).rejects.toThrow(BadRequestException);
    });

    it('존재하지 않는 주문이면 NotFoundException', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(service.updateStatus(1, 999, 'PREPARING')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('주문을 삭제한다', async () => {
      const order = { id: 1, storeId: 1, items: [] };
      mockOrderRepo.findOne.mockResolvedValue(order);
      mockOrderRepo.remove.mockResolvedValue(order);
      await service.delete(1, 1);
      expect(mockOrderRepo.remove).toHaveBeenCalledWith(order);
    });
  });

  describe('moveToHistory', () => {
    it('주문을 이력으로 이동하고 원본 삭제', async () => {
      const orders = [{
        id: 1, sessionId: 10, orderNumber: 'ORD-20260305-0001',
        totalAmount: 16000, createdAt: new Date(),
        items: [{ menuName: '김치찌개', quantity: 2, unitPrice: 8000, subtotal: 16000 }],
      }];
      mockOrderRepo.find.mockResolvedValue(orders);
      mockHistoryRepo.create.mockReturnValue({});
      mockHistoryRepo.save.mockResolvedValue([]);
      mockOrderRepo.remove.mockResolvedValue([]);
      await service.moveToHistory(1, 1, 10);
      expect(mockHistoryRepo.save).toHaveBeenCalled();
      expect(mockOrderRepo.remove).toHaveBeenCalledWith(orders);
    });
  });
});
