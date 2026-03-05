import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { StoreService } from './store.service';
import { Store } from './store.entity';

describe('StoreService', () => {
  let service: StoreService;
  let storeRepo: any;

  const mockStore: Store = {
    id: 1,
    storeIdentifier: 'demo-store',
    name: '데모 매장',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        {
          provide: getRepositoryToken(Store),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
    storeRepo = module.get(getRepositoryToken(Store));
  });

  describe('findById', () => {
    it('매장이 존재하면 반환한다', async () => {
      storeRepo.findOne.mockResolvedValue(mockStore);
      const result = await service.findById(1);
      expect(result).toEqual(mockStore);
    });

    it('매장이 없으면 NotFoundException', async () => {
      storeRepo.findOne.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIdentifier', () => {
    it('식별자로 매장을 찾는다', async () => {
      storeRepo.findOne.mockResolvedValue(mockStore);
      const result = await service.findByIdentifier('demo-store');
      expect(result.storeIdentifier).toBe('demo-store');
    });

    it('식별자가 없으면 NotFoundException', async () => {
      storeRepo.findOne.mockResolvedValue(null);
      await expect(service.findByIdentifier('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
