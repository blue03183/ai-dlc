import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { OwnerGuard } from './owner.guard';
import { Store } from '../store/store.entity';
import { Admin } from '../admin/admin.entity';
import { TableEntity } from '../table/table.entity';
import { TableSession } from '../table/table-session.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '16h') },
      }),
    }),
    TypeOrmModule.forFeature([Store, Admin, TableEntity, TableSession]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, OwnerGuard],
  exports: [JwtAuthGuard, OwnerGuard, JwtModule],
})
export class AuthModule {}
