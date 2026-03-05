import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepo: Repository<Store>,
  ) {}

  async findById(storeId: number): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { id: storeId } });
    if (!store) throw new NotFoundException('매장을 찾을 수 없습니다.');
    return store;
  }

  async findByIdentifier(storeIdentifier: string): Promise<Store> {
    const store = await this.storeRepo.findOne({ where: { storeIdentifier } });
    if (!store) throw new NotFoundException('매장을 찾을 수 없습니다.');
    return store;
  }
}
