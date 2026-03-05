import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Store } from '../src/modules/store/store.entity';
import { Admin, AdminRole } from '../src/modules/admin/admin.entity';
import { TableEntity } from '../src/modules/table/table.entity';

describe('Auth Flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    // 테스트 데이터 준비
    const storeRepo = dataSource.getRepository(Store);
    const adminRepo = dataSource.getRepository(Admin);
    const tableRepo = dataSource.getRepository(TableEntity);

    let store = await storeRepo.findOne({ where: { storeIdentifier: 'test-store' } });
    if (!store) {
      store = await storeRepo.save(
        storeRepo.create({ storeIdentifier: 'test-store', name: '테스트 매장' }),
      );
    }

    const hashedPw = await bcrypt.hash('admin123', 10);
    const existingAdmin = await adminRepo.findOne({
      where: { storeId: store.id, username: 'testowner' },
    });
    if (!existingAdmin) {
      await adminRepo.save(
        adminRepo.create({
          storeId: store.id,
          username: 'testowner',
          password: hashedPw,
          role: AdminRole.OWNER,
        }),
      );
    }

    const tablePw = await bcrypt.hash('table123', 10);
    const existingTable = await tableRepo.findOne({
      where: { storeId: store.id, tableNumber: 99 },
    });
    if (!existingTable) {
      await tableRepo.save(
        tableRepo.create({ storeId: store.id, tableNumber: 99, password: tablePw }),
      );
    }
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    const storeRepo = dataSource.getRepository(Store);
    const store = await storeRepo.findOne({ where: { storeIdentifier: 'test-store' } });
    if (store) {
      await dataSource.getRepository(TableEntity).delete({ storeId: store.id });
      await dataSource.getRepository(Admin).delete({ storeId: store.id });
      await storeRepo.delete(store.id);
    }
    await app.close();
  });

  describe('POST /api/auth/admin/login', () => {
    it('정상 로그인 시 200 + 토큰 반환', () => {
      return request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ storeIdentifier: 'test-store', username: 'testowner', password: 'admin123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.token).toBeDefined();
          expect(res.body.data.admin.role).toBe('OWNER');
        });
    });

    it('잘못된 비밀번호 시 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ storeIdentifier: 'test-store', username: 'testowner', password: 'wrong' })
        .expect(401);
    });

    it('존재하지 않는 매장 시 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ storeIdentifier: 'nonexistent', username: 'testowner', password: 'admin123' })
        .expect(401);
    });

    it('빈 body 시 400 (validation)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /api/auth/table/login', () => {
    it('정상 로그인 시 200 + 토큰 반환', () => {
      return request(app.getHttpServer())
        .post('/api/auth/table/login')
        .send({ storeIdentifier: 'test-store', tableNumber: 99, password: 'table123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.token).toBeDefined();
          expect(res.body.data.table.tableNumber).toBe(99);
        });
    });

    it('잘못된 비밀번호 시 401', () => {
      return request(app.getHttpServer())
        .post('/api/auth/table/login')
        .send({ storeIdentifier: 'test-store', tableNumber: 99, password: 'wrong' })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('유효한 토큰으로 인증 정보 조회', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ storeIdentifier: 'test-store', username: 'testowner', password: 'admin123' });

      const token = loginRes.body.data.token;

      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.type).toBe('admin');
          expect(res.body.data.storeId).toBeDefined();
        });
    });

    it('토큰 없이 접근 시 401', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });
});
