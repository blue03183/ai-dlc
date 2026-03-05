import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getRepositoryToken(Category), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<CategoryService>(CategoryService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('중복 카테고리명이면 ConflictException', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, name: '메인' });
      await expect(service.create(1, { name: '메인' })).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('존재하지 않는 카테고리면 NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.delete(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
