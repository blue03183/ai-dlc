import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAllByStore(storeId: number): Promise<Category[]> {
    return this.categoryRepo.find({
      where: { storeId },
      order: { sortOrder: 'ASC' },
    });
  }

  async create(storeId: number, dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepo.findOne({
      where: { storeId, name: dto.name },
    });
    if (existing) {
      throw new ConflictException('동일한 카테고리명이 이미 존재합니다.');
    }

    const maxOrder = await this.categoryRepo
      .createQueryBuilder('c')
      .select('MAX(c.sortOrder)', 'max')
      .where('c.storeId = :storeId', { storeId })
      .getRawOne();

    const category = this.categoryRepo.create({
      storeId,
      name: dto.name,
      sortOrder: (maxOrder?.max ?? -1) + 1,
    });
    return this.categoryRepo.save(category);
  }

  async update(storeId: number, categoryId: number, dto: CreateCategoryDto): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId, storeId } });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    category.name = dto.name;
    return this.categoryRepo.save(category);
  }

  async delete(storeId: number, categoryId: number): Promise<void> {
    const category = await this.categoryRepo.findOne({ where: { id: categoryId, storeId } });
    if (!category) throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    await this.categoryRepo.remove(category);
  }
}
