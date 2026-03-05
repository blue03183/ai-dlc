import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Store } from '../store/store.entity';
import { Admin } from '../admin/admin.entity';
import { TableEntity } from '../table/table.entity';
import { TableSession, SessionStatus } from '../table/table-session.entity';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    @InjectRepository(TableEntity)
    private readonly tableRepo: Repository<TableEntity>,
    @InjectRepository(TableSession)
    private readonly sessionRepo: Repository<TableSession>,
    private readonly jwtService: JwtService,
  ) {}

  async adminLogin(
    storeIdentifier: string,
    username: string,
    password: string,
  ) {
    const store = await this.storeRepo.findOne({
      where: { storeIdentifier },
    });
    if (!store) throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');

    const admin = await this.adminRepo.findOne({
      where: { storeId: store.id, username },
    });
    if (!admin) throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');

    // 계정 잠금 확인
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new ForbiddenException('계정이 잠겨 있습니다. 잠시 후 다시 시도해주세요.');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      admin.loginAttempts += 1;
      if (admin.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        admin.lockedUntil = new Date(Date.now() + LOCK_DURATION_MINUTES * 60 * 1000);
      }
      await this.adminRepo.save(admin);
      throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');
    }

    // 로그인 성공 → 카운터 리셋
    admin.loginAttempts = 0;
    admin.lockedUntil = null;
    await this.adminRepo.save(admin);

    const token = this.jwtService.sign({
      sub: admin.id,
      adminId: admin.id,
      storeId: store.id,
      role: admin.role,
      type: 'admin',
    });

    return {
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        storeName: store.name,
        storeId: store.id,
      },
    };
  }

  async tableLogin(
    storeIdentifier: string,
    tableNumber: number,
    password: string,
  ) {
    const store = await this.storeRepo.findOne({
      where: { storeIdentifier },
    });
    if (!store) throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');

    const table = await this.tableRepo.findOne({
      where: { storeId: store.id, tableNumber },
    });
    if (!table) throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');

    const isPasswordValid = await bcrypt.compare(password, table.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');
    }

    // 현재 ACTIVE 세션 조회
    const session = await this.sessionRepo.findOne({
      where: { tableId: table.id, status: SessionStatus.ACTIVE },
    });

    const token = this.jwtService.sign({
      sub: table.id,
      tableId: table.id,
      storeId: store.id,
      tableNumber: table.tableNumber,
      sessionId: session?.id ?? null,
      type: 'table',
    });

    return {
      token,
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        storeName: store.name,
        storeId: store.id,
      },
      session: session ? { id: session.id, status: session.status } : null,
    };
  }
}
