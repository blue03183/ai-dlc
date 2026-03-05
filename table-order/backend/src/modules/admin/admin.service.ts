import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  async findAllByStore(storeId: number): Promise<Admin[]> {
    return this.adminRepo.find({
      where: { storeId },
      select: ['id', 'username', 'role', 'createdAt'],
      order: { createdAt: 'ASC' },
    });
  }

  async create(storeId: number, dto: CreateAdminDto): Promise<Admin> {
    const existing = await this.adminRepo.findOne({
      where: { storeId, username: dto.username },
    });
    if (existing) {
      throw new ConflictException('이미 존재하는 사용자명입니다.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const admin = this.adminRepo.create({
      storeId,
      username: dto.username,
      password: hashedPassword,
      role: dto.role,
    });

    const saved = await this.adminRepo.save(admin);
    const { password, ...result } = saved;
    return result as Admin;
  }
}
