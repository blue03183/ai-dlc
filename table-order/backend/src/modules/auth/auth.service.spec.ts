import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Store } from '../store/store.entity';
import { Admin, AdminRole } from '../admin/admin.entity';
import { TableEntity } from '../table/table.entity';
import { TableSession, SessionStatus } from '../table/table-session.entity';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let storeRepo: any;
  let adminRepo: any;
  let tableRepo: any;
  let sessionRepo: any;
  let jwtService: any;

  const mockStore: Store = {
    id: 1,
    storeIdentifier: 'demo-store',
    name: '데모 매장',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAdmin: Admin = {
    id: 1,
    storeId: 1,
    username: 'owner',
    password: 'hashed-password',
    role: AdminRole.OWNER,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    store: mockStore,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Store),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(Admin),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
        {
          provide: getRepositoryToken(TableEntity),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(TableSession),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('mock-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    storeRepo = module.get(getRepositoryToken(Store));
    adminRepo = module.get(getRepositoryToken(Admin));
    tableRepo = module.get(getRepositoryToken(TableEntity));
    sessionRepo = module.get(getRepositoryToken(TableSession));
    jwtService = module.get(JwtService);
  });

  describe('adminLogin', () => {
    it('정상 로그인 시 토큰을 반환한다', async () => {
      storeRepo.findOne.mockResolvedValue(mockStore);
      adminRepo.findOne.mockResolvedValue({ ...mockAdmin });
      adminRepo.save.mockResolvedValue(mockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.adminLogin('demo-store', 'owner', 'admin123');

      expect(result.token).toBe('mock-token');
      expect(result.admin.username).toBe('owner');
      expect(result.admin.role).toBe(AdminRole.OWNER);
    });

    it('존재하지 않는 매장이면 UnauthorizedException', async () => {
      storeRepo.findOne.mockResolvedValue(null);

      await expect(
        service.adminLogin('unknown', 'owner', 'admin123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('존재하지 않는 관리자면 UnauthorizedException', async () => {
      storeRepo.findOne.mockResolvedValue(mockStore);
      adminRepo.findOne.mockResolvedValue(null);

      await expect(
        service.adminLogin('demo-store', 'unknown', 'admin123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('계정이 잠겨있으면 ForbiddenException', async () => {
      storeRepo.findOne.mockResolvedValue(mockStore);
      adminRepo.findOne.mockResolvedValue({
        ...mockAdmin,
        lockedUntil: new Date(Date.now() + 60000),
      });

      await expect(
        service.adminLogin('demo-store', 'owner', 'admin123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('비밀번호 틀리면 loginAttempts 증가', async () => {
      const admin = { ...mockAdmin, loginAttempts: 0 };
      storeRepo.findOne.mockResolvedValue(mockStore);
      adminRepo.findOne.mockResolvedValue(admin);
      adminRepo.save.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.adminLogin('demo-store', 'owner', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);

      expect(adminRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ loginAttempts: 1 }),
      );
    });

    it('5회 실패 시 계정 잠금', async () => {
      const admin = { ...mockAdmin, loginAttempts: 4 };
      storeRepo.findOne.mockResolvedValue(mockStore);
      adminRepo.findOne.mockResolvedValue(admin);
      adminRepo.save.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.adminLogin('demo-store', 'owner', 'wrong'),
      ).rejects.toThrow(UnauthorizedException);

      expect(adminRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          loginAttempts: 5,
          lockedUntil: expect.any(Date),
        }),
      );
    });
  });

  describe('tableLogin', () => {
    const mockTable: TableEntity = {
      id: 1,
      storeId: 1,
      tableNumber: 1,
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
      store: mockStore,
    };

    it('정상 로그인 시 토큰을 반환한다', async () => {
      storeRepo.findOne.mockResolvedValue(mockStore);
      tableRepo.findOne.mockResolvedValue(mockTable);
      sessionRepo.findOne.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.tableLogin('demo-store', 1, 'table123');

      expect(result.token).toBe('mock-token');
      expect(result.table.tableNumber).toBe(1);
      expect(result.session).toBeNull();
    });

    it('ACTIVE 세션이 있으면 세션 정보 포함', async () => {
      const mockSession = { id: 10, status: SessionStatus.ACTIVE };
      storeRepo.findOne.mockResolvedValue(mockStore);
      tableRepo.findOne.mockResolvedValue(mockTable);
      sessionRepo.findOne.mockResolvedValue(mockSession);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.tableLogin('demo-store', 1, 'table123');

      expect(result.session).toEqual({ id: 10, status: SessionStatus.ACTIVE });
    });

    it('비밀번호 틀리면 UnauthorizedException', async () => {
      storeRepo.findOne.mockResolvedValue(mockStore);
      tableRepo.findOne.mockResolvedValue(mockTable);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.tableLogin('demo-store', 1, 'wrong'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
