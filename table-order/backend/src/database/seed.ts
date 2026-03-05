import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Store } from '../modules/store/store.entity';
import { Admin, AdminRole } from '../modules/admin/admin.entity';
import { join } from 'path';

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME || 'tableorder',
  password: process.env.DB_PASSWORD || 'tableorder',
  database: process.env.DB_DATABASE || 'tableorder',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  console.log('DB 연결 완료');

  const storeRepo = dataSource.getRepository(Store);
  const adminRepo = dataSource.getRepository(Admin);

  let store = await storeRepo.findOne({ where: { storeIdentifier: 'demo-store' } });
  if (!store) {
    store = storeRepo.create({ storeIdentifier: 'demo-store', name: '데모 매장' });
    store = await storeRepo.save(store);
    console.log(`매장 생성: ${store.name} (ID: ${store.id})`);
  }

  const existing = await adminRepo.findOne({ where: { storeId: store.id, username: 'owner' } });
  if (!existing) {
    const hashed = await bcrypt.hash('owner1234', 10);
    const admin = adminRepo.create({ storeId: store.id, username: 'owner', password: hashed, role: AdminRole.OWNER });
    await adminRepo.save(admin);
    console.log('OWNER 관리자 생성: owner / owner1234');
  }

  await dataSource.destroy();
  console.log('시드 완료');
}

seed().catch((err) => { console.error('시드 실패:', err); process.exit(1); });
