import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { Menu } from './menu.entity';
import { Category } from './category.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

const mockMenuRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};
const mockCategoryRepo = { findOne: jest.fn() };

describe('MenuService', () => {
  let service: MenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: getRepositoryToken(Menu), useValue: mockMenuRepo },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();
    service = module.get<MenuService>(MenuService);
    jest.clearAllMocks();
  });

  describe('findAllByStore', () => {
    it('매장의 전체 메뉴를 조회한다', async () => {
      const menus = [{ id: 1, name: '김치찌개', price: 8000 }];
      mockMenuRepo.find.mockResolvedValue(menus);
      const result = await service.findAllByStore(1);
      expect(result).toEqual(menus);
    });

    it('카테고리 필터로 메뉴를 조회한다', async () => {
      mockMenuRepo.find.mockResolvedValue([]);
      await service.findAllByStore(1, 2);
      expect(mockMenuRepo.find).toHaveBeenCalledWith({
        where: { storeId: 1, categoryId: 2 },
        order: { categoryId: 'ASC', sortOrder: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('메뉴가 없으면 NotFoundException', async () => {
      mockMenuRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('다른 매장의 카테고리면 BadRequestException', async () => {
      mockCategoryRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create(1, { name: '메뉴', price: 5000, categoryId: 999 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('메뉴를 소프트 삭제한다 (isAvailable=false)', async () => {
      const menu = { id: 1, storeId: 1, isAvailable: true };
      mockMenuRepo.findOne.mockResolvedValue(menu);
      mockMenuRepo.save.mockResolvedValue({ ...menu, isAvailable: false });
      await service.delete(1, 1);
      expect(mockMenuRepo.save).toHaveBeenCalledWith(expect.objectContaining({ isAvailable: false }));
    });
  });
});
