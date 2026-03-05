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
import { TableSession } from '../src/modules/table/table-session.entity';
import { Order } from '../src/modules/order/order.entity';
import { OrderItem } from '../src/modules/order/order-item.entity';
import { OrderHistory } from '../src/modules/order/order-history.entity';

describe('Order Flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let tableToken: string;
  let storeId: number;
  let tableId: number;
  let menuId: number;

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
    const categoryRepo = dataSource.getRepository(Category);
    const menuRepo = dataSource.getRepository(Menu);

    let store = await storeRepo.findOne({ where: { storeIdentifier: 'order-test-store' } });
    if (!store) {
      store = await storeRepo.save(
        storeRepo.create({ storeIdentifier: 'order-test-store', name: '주문테스트 매장' }),
      );
    }
    storeId = store.id;

    const hashedPw = await bcrypt.hash('admin123', 10);
    let admin = await adminRepo.findOne({ where: { storeId, username: 'orderowner' } });
    if (!admin) {
      admin = await adminRepo.save(
        adminRepo.create({ storeId, username: 'orderowner', password: hashedPw, role: AdminRole.OWNER }),
      );
    }

    const tablePw = await bcrypt.hash('table123', 10);
    let table = await tableRepo.findOne({ where: { storeId, tableNumber: 88 } });
    if (!table) {
      table = await tableRepo.save(
        tableRepo.create({ storeId, tableNumber: 88, password: tablePw }),
      );
    }
    tableId = table.id;

    let category = await categoryRepo.findOne({ where: { storeId, name: '테스트카테고리' } });
    if (!category) {
      category = await categoryRepo.save(
        categoryRepo.create({ storeId, name: '테스트카테고리', sortOrder: 1 }),
      );
    }

    let menu = await menuRepo.findOne({ where: { storeId, name: '테스트메뉴' } });
    if (!menu) {
      menu = await menuRepo.save(
        menuRepo.create({
          storeId,
          categoryId: category.id,
          name: '테스트메뉴',
          price: 10000,
          sortOrder: 1,
          isAvailable: true,
        }),
      );
    }
    menuId = menu.id;

    // 토큰 획득
    const adminLogin = await request(app.getHttpServer())
      .post('/api/auth/admin/login')
      .send({ storeIdentifier: 'order-test-store', username: 'orderowner', password: 'admin123' });
    adminToken = adminLogin.body.data.token;

    const tableLogin = await request(app.getHttpServer())
      .post('/api/auth/table/login')
      .send({ storeIdentifier: 'order-test-store', tableNumber: 88, password: 'table123' });
    tableToken = tableLogin.body.data.token;
  });

  afterAll(async () => {
    // 테스트 데이터 정리 (역순)
    await dataSource.getRepository(OrderHistory).delete({ storeId });
    await dataSource.getRepository(OrderItem).delete({});
    await dataSource.getRepository(Order).delete({ storeId });
    await dataSource.getRepository(TableSession).delete({ storeId });
    await dataSource.getRepository(Menu).delete({ storeId });
    await dataSource.getRepository(Category).delete({ storeId });
    await dataSource.getRepository(TableEntity).delete({ storeId });
    await dataSource.getRepository(Admin).delete({ storeId });
    await dataSource.getRepository(Store).delete(storeId);
    await app.close();
  });

  it('주문 생성 → 상태 변경 → 이용 완료 전체 플로우', async () => {
    // 1. 주문 생성 (테이블 토큰)
    const createRes = await request(app.getHttpServer())
      .post(`/api/stores/${storeId}/orders`)
      .set('Authorization', `Bearer ${tableToken}`)
      .send({
        tableId,
        items: [{ menuId, quantity: 2 }],
      })
      .expect(201);

    expect(createRes.body.success).toBe(true);
    const orderId = createRes.body.data.id;
    expect(createRes.body.data.status).toBe('PENDING');
    expect(createRes.body.data.totalAmount).toBe(20000);

    // 2. 주문 조회 (관리자 토큰)
    const listRes = await request(app.getHttpServer())
      .get(`/api/stores/${storeId}/orders`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(listRes.body.data.length).toBeGreaterThanOrEqual(1);

    // 3. 상태 변경: PENDING → PREPARING
    await request(app.getHttpServer())
      .put(`/api/stores/${storeId}/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PREPARING' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.status).toBe('PREPARING');
      });

    // 4. 상태 변경: PREPARING → COMPLETED
    await request(app.getHttpServer())
      .put(`/api/stores/${storeId}/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.status).toBe('COMPLETED');
      });

    // 5. 역방향 상태 변경 불가: COMPLETED → PREPARING
    await request(app.getHttpServer())
      .put(`/api/stores/${storeId}/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'PREPARING' })
      .expect(400);

    // 6. 이용 완료
    await request(app.getHttpServer())
      .post(`/api/stores/${storeId}/tables/${tableId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201)
      .expect((res) => {
        expect(res.body.data.success).toBe(true);
      });

    // 7. 이용 완료 후 현재 주문 비어있음
    const afterComplete = await request(app.getHttpServer())
      .get(`/api/stores/${storeId}/tables/${tableId}/orders`)
      .set('Authorization', `Bearer ${tableToken}`)
      .expect(200);

    expect(afterComplete.body.data).toHaveLength(0);

    // 8. 과거 주문 이력에 존재
    const historyRes = await request(app.getHttpServer())
      .get(`/api/stores/${storeId}/tables/${tableId}/orders/history`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(historyRes.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
