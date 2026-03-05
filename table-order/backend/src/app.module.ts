import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/platform-express';
import { join } from 'path';

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
    // Feature modules will be added here in subsequent steps
    // AuthModule,
    // StoreModule,
    // AdminModule,
    // TableModule,
    // MenuModule,
    // OrderModule,
    // EventModule,
    // UploadModule,
  ],
})
export class AppModule {}
