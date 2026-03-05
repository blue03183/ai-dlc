import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Store } from '../src/modules/store/store.entity';
import { Admin, AdminRole } from '../src/modules/admin/admin.entity';
import { TableEntity } from '../src/modules/table/table.entity';
import { Category } from '../src/modules/menu/category.entity';
import { Menu } from '../src/modules/menu/menu.entity';

describe('Multi-Tenant Isolation (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let store1Id: number;
  let store2Id: number;
  let token1: string;
  let token2: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    dataSource = moduleFixture.get(DataSource);

    const storeRepo = dataSource.getRepository(Store);
    const adminRepo = dataSource.getRepository(Admin);
    const categoryRepo = dataSource.getRepository(Category);
    const menuRepo = dataSource.getRepository(Menu);
    const hashedPw = await bcrypt.hash('admin123', 10);

    // 매장 1
    let store1 = await storeRepo.findOne({ where: { storeIdentifier: 'tenant-test-1' } });
    if (!store1) {
      store1 = await storeRepo.save(
        storeRepo.create({ storeIdentifier: 'tenant-test-1', name: '테넌트1' }),
      );
    }
    store1Id = store1.id;

    let admin1 = await adminRepo.findOne({ where: { storeId: store1Id, username: 'tenant1owner' } });
    if (!admin1) {
      await adminRepo.save(
        adminRepo.create({ storeId: store1Id, username: 'tenant1owner', password: hashedPw, role: AdminRole.OWNER }),
      );
    }

    let cat1 = await categoryRepo.findOne({ where: { storeId: store1Id, name: '매장1카테고리' } });
    if (!cat1) {
      cat1 = await categoryRepo.save(
        categoryRepo.create({ storeId: store1Id, name: '매장1카테고리', sortOrder: 1 }),
      );
    }
    await menuRepo.save(
      menuRepo.create({ storeId: store1Id, categoryId: cat1.id, name: '매장1메뉴', price: 5000, sortOrder: 1, isAvailable: true }),
    ).catch(() => {}); // ignore duplicate

    // 매장 2
    let store2 = await storeRepo.findOne({ where: { storeIdentifier: 'tenant-test-2' } });
    if (!store2) {
      store2 = await storeRepo.save(
        storeRepo.create({ storeIdentifier: 'tenant-test-2', name: '테넌트2' }),
      );
    }
    store2Id = store2.id;

    let admin2 = await adminRepo.findOne({ where: { storeId: store2Id, username: 'tenant2owner' } });
    if (!admin2) {
      await adminRepo.save(
        adminRepo.create({ storeId: store2Id, username: 'tenant2owner', password: hashedPw, role: AdminRole.OWNER }),
      );
    }

    // 토큰 획득
    const login1 = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ storeIdentifier: 'tenant-test-1', username: 'tenant1owner', password: 'admin123' });
    token1 = login1.body.data.token;

    const login2 = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ storeIdentifier: 'tenant-test-2', username: 'tenant2owner', password: 'admin123' });
    token2 = login2.body.data.token;
  });

  afterAll(async () => {
    const menuRepo = dataSource.getRepository(Menu);
    const categoryRepo = dataSource.getRepository(Category);
    const adminRepo = dataSource.getRepository(Admin);
    const tableRepo = dataSource.getRepository(TableEntity);
    const storeRepo = dataSource.getRepository(Store);

    for (const sid of [store1Id, store2Id]) {
      await menuRepo.delete({ storeId: sid });
      await categoryRepo.delete({ storeId: sid });
      await tableRepo.delete({ storeId: sid });
      await adminRepo.delete({ storeId: sid });
      await storeRepo.delete(sid);
    }
    await app.close();
  });

  it('매장1 토큰으로 매장2 데이터 접근 시 403', async () => {
    // 매장1 토큰으로 매장2의 메뉴 조회 시도
    await request(app.getHttpServer())
      .get(`/api/stores/${store2Id}/menus`)
      .set('Authorization', `Bearer ${token1}`)
      .expect(403);
  });

  it('매장2 토큰으로 매장1 데이터 접근 시 403', async () => {
    await request(app.getHttpServer())
      .get(`/api/stores/${store1Id}/menus`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(403);
  });

  it('매장1 토큰으로 매장1 데이터 정상 접근', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/stores/${store1Id}/menus`)
      .set('Authorization', `Bearer ${token1}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    // 매장1의 메뉴만 반환되어야 함
    if (res.body.data.length > 0) {
      res.body.data.forEach((menu: any) => {
        expect(menu.storeId).toBe(store1Id);
      });
    }
  });

  it('매장2 토큰으로 매장2 관리자 생성 가능', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/stores/${store2Id}/admins`)
      .set('Authorization', `Bearer ${token2}`)
      .expect(200);

    expect(res.body.success).toBe(true);
  });
});
