import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { StoreModule } from './modules/store/store.module';
import { AdminModule } from './modules/admin/admin.module';
import { TableModule } from './modules/table/table.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', 'password'),
        database: config.get('DB_DATABASE', 'table_order'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true, // 개발 환경 전용
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    StoreModule,
    AdminModule,
    TableModule,
    // MenuModule,    — BE-Dev2 Step 6
    // OrderModule,   — BE-Dev2 Step 7
    // EventModule,   — BE-Dev2 Step 8
    // UploadModule,  — BE-Dev2 Step 6
  ],
})
export class AppModule {}
