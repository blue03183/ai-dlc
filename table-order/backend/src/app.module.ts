import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/platform-express';
import { join } from 'path';
import { MenuModule } from './modules/menu/menu.module';
import { OrderModule } from './modules/order/order.module';
import { EventModule } from './modules/event/event.module';
import { UploadModule } from './modules/upload/upload.module';

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
        username: config.get('DB_USERNAME', 'tableorder'),
        password: config.get('DB_PASSWORD', 'tableorder'),
        database: config.get('DB_DATABASE', 'tableorder'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true, // 개발 환경 전용
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    // BE-Dev1 modules (to be added)
    // AuthModule,
    // StoreModule,
    // AdminModule,
    // TableModule,
    // BE-Dev2 modules
    MenuModule,
    OrderModule,
    EventModule,
    UploadModule,
  ],
})
export class AppModule {}
