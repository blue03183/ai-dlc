import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TableService } from './table.service';
import { TableEntity } from './table.entity';
import { TableSession, SessionStatus } from './table-session.entity';
import { Order } from '../order/order.entity';
import { OrderItem } from '../order/order-item.entity';
import { OrderHistory } from '../order/order-history.entity';

jest.mock('bcrypt');

describe('TableService', () => {
  let service: TableService;
  let tableRepo: any;
  let sessionRepo: any;
  let orderRepo: any;
  let mockQueryRunner: any;

  beforeEach(async () => {
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TableService,
        {
          provide: getRepositoryToken(TableEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TableSession),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {},
        },
        {
          provide: getRepositoryToken(OrderHistory),
          useValue: { create: jest.fn() },
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner) },
        },
      ],
    }).compile();

    service = module.get<TableService>(TableService);
    tableRepo = module.get(getRepositoryToken(TableEntity));
    sessionRepo = module.get(getRepositoryToken(TableSession));
    orderRepo = module.get(getRepositoryToken(Order));
  });

  describe('findAllByStore', () => {
    it('매장의 테이블 목록을 반환한다', async () => {
      const tables = [{ id: 1, tableNumber: 1 }, { id: 2, tableNumber: 2 }];
      tableRepo.find.mockResolvedValue(tables);

      const result = await service.findAllByStore(1);
      expect(result).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('새 테이블을 생성한다', async () => {
      tableRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      tableRepo.create.mockReturnValue({ storeId: 1, tableNumber: 6, password: 'hashed' });
      tableRepo.save.mockResolvedValue({
        id: 6, storeId: 1, tableNumber: 6, password: 'hashed',
        createdAt: new Date(), updatedAt: new Date(),
      });

      const result = await service.create(1, { tableNumber: 6, password: 'table123' });
      expect(result.tableNumber).toBe(6);
      expect((result as any).password).toBeUndefined();
    });

    it('중복 테이블 번호면 ConflictException', async () => {
      tableRepo.findOne.mockResolvedValue({ id: 1, tableNumber: 1 });

      await expect(
        service.create(1, { tableNumber: 1, password: 'table123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('테이블 정보를 수정한다', async () => {
      const table = { id: 1, storeId: 1, tableNumber: 1, password: 'old' };
      tableRepo.findOne.mockResolvedValue({ ...table });
      tableRepo.save.mockResolvedValue({ ...table, tableNumber: 1 });

      const result = await service.update(1, 1, {});
      expect(result).toBeDefined();
    });

    it('존재하지 않는 테이블이면 NotFoundException', async () => {
      tableRepo.findOne.mockResolvedValue(null);

      await expect(service.update(1, 999, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeSession', () => {
    it('활성 세션이 없으면 BadRequestException', async () => {
      sessionRepo.findOne.mockResolvedValue(null);

      await expect(service.completeSession(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('이용 완료 시 트랜잭션을 실행한다', async () => {
      const session = { id: 10, storeId: 1, tableId: 1, status: SessionStatus.ACTIVE };
      sessionRepo.findOne.mockResolvedValue(session);
      orderRepo.find.mockResolvedValue([
        {
          id: 1,
          orderNumber: 'ORD-20260305-0001',
          totalAmount: 10000,
          createdAt: new Date(),
          items: [
            { menuName: '김치찌개', quantity: 1, unitPrice: 9000, subtotal: 9000 },
            { menuName: '공기밥', quantity: 1, unitPrice: 1000, subtotal: 1000 },
          ],
        },
      ]);

      await service.completeSession(1, 1);

      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
