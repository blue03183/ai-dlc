import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminService } from './admin.service';
import { Admin, AdminRole } from './admin.entity';

jest.mock('bcrypt');

describe('AdminService', () => {
  let service: AdminService;
  let adminRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(Admin),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepo = module.get(getRepositoryToken(Admin));
  });

  describe('findAllByStore', () => {
    it('매장의 관리자 목록을 반환한다', async () => {
      const admins = [
        { id: 1, username: 'owner', role: AdminRole.OWNER, createdAt: new Date() },
      ];
      adminRepo.find.mockResolvedValue(admins);

      const result = await service.findAllByStore(1);
      expect(result).toEqual(admins);
      expect(adminRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { storeId: 1 } }),
      );
    });
  });

  describe('create', () => {
    it('새 관리자를 생성한다', async () => {
      adminRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      adminRepo.create.mockReturnValue({
        storeId: 1,
        username: 'newadmin',
        password: 'hashed',
        role: AdminRole.MANAGER,
      });
      adminRepo.save.mockResolvedValue({
        id: 2,
        storeId: 1,
        username: 'newadmin',
        password: 'hashed',
        role: AdminRole.MANAGER,
      });

      const result = await service.create(1, {
        username: 'newadmin',
        password: 'pass1234',
        role: AdminRole.MANAGER,
      });

      expect(result.username).toBe('newadmin');
      expect((result as any).password).toBeUndefined();
    });

    it('중복 사용자명이면 ConflictException', async () => {
      adminRepo.findOne.mockResolvedValue({ id: 1, username: 'existing' });

      await expect(
        service.create(1, {
          username: 'existing',
          password: 'pass1234',
          role: AdminRole.MANAGER,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
