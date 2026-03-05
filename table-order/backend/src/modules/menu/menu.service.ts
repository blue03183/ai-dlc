import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './menu.entity';
import { Category } from './category.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu) private readonly menuRepo: Repository<Menu>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAllByStore(storeId: number, categoryId?: number): Promise<Menu[]> {
    const where: any = { storeId };
    if (categoryId) where.categoryId = categoryId;
    return this.menuRepo.find({ where, order: { categoryId: 'ASC', sortOrder: 'ASC' } });
  }

  async findOne(storeId: number, menuId: number): Promise<Menu> {
    const menu = await this.menuRepo.findOne({ where: { id: menuId, storeId } });
    if (!menu) throw new NotFoundException('메뉴를 찾을 수 없습니다.');
    return menu;
  }

  async create(storeId: number, dto: CreateMenuDto): Promise<Menu> {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId, storeId } });
    if (!category) throw new BadRequestException('해당 매장의 카테고리가 아닙니다.');

    const maxOrder = await this.menuRepo
      .createQueryBuilder('m')
      .select('MAX(m.sortOrder)', 'max')
      .where('m.storeId = :storeId AND m.categoryId = :categoryId', { storeId, categoryId: dto.categoryId })
      .getRawOne();

    const menu = this.menuRepo.create({
      storeId,
      ...dto,
      sortOrder: (maxOrder?.max ?? -1) + 1,
    });
    return this.menuRepo.save(menu);
  }

  async update(storeId: number, menuId: number, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(storeId, menuId);
    if (dto.categoryId) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId, storeId } });
      if (!category) throw new BadRequestException('해당 매장의 카테고리가 아닙니다.');
    }
    Object.assign(menu, dto);
    return this.menuRepo.save(menu);
  }

  async delete(storeId: number, menuId: number): Promise<void> {
    const menu = await this.findOne(storeId, menuId);
    menu.isAvailable = false;
    await this.menuRepo.save(menu);
  }

  async reorder(storeId: number, dto: ReorderMenuDto): Promise<void> {
    for (const item of dto.items) {
      const menu = await this.menuRepo.findOne({ where: { id: item.menuId, storeId } });
      if (!menu) throw new BadRequestException(`메뉴 ID ${item.menuId}를 찾을 수 없습니다.`);
      menu.sortOrder = item.sortOrder;
      await this.menuRepo.save(menu);
    }
  }
}
