import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, ParseIntPipe,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CategoryService } from './category.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ReorderMenuDto } from './dto/reorder-menu.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiResponse } from '../../common';

@Controller('stores/:storeId')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly categoryService: CategoryService,
  ) {}

  // --- 메뉴 ---

  @Get('menus')
  async findAllMenus(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('categoryId') categoryId?: string,
  ) {
    const catId = categoryId ? Number(categoryId) : undefined;
    return ApiResponse.ok(await this.menuService.findAllByStore(storeId, catId));
  }

  @Get('menus/:menuId')
  async findOneMenu(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('menuId', ParseIntPipe) menuId: number,
  ) {
    return ApiResponse.ok(await this.menuService.findOne(storeId, menuId));
  }

  @Post('menus')
  async createMenu(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateMenuDto,
  ) {
    return ApiResponse.ok(await this.menuService.create(storeId, dto));
  }

  @Put('menus/reorder')
  async reorderMenus(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: ReorderMenuDto,
  ) {
    await this.menuService.reorder(storeId, dto);
    return ApiResponse.ok({ reordered: true });
  }

  @Put('menus/:menuId')
  async updateMenu(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() dto: UpdateMenuDto,
  ) {
    return ApiResponse.ok(await this.menuService.update(storeId, menuId, dto));
  }

  @Delete('menus/:menuId')
  async deleteMenu(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('menuId', ParseIntPipe) menuId: number,
  ) {
    await this.menuService.delete(storeId, menuId);
    return ApiResponse.ok({ deleted: true });
  }

  // --- 카테고리 ---

  @Get('categories')
  async findAllCategories(@Param('storeId', ParseIntPipe) storeId: number) {
    return ApiResponse.ok(await this.categoryService.findAllByStore(storeId));
  }

  @Post('categories')
  async createCategory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: CreateCategoryDto,
  ) {
    return ApiResponse.ok(await this.categoryService.create(storeId, dto));
  }

  @Put('categories/:categoryId')
  async updateCategory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Body() dto: CreateCategoryDto,
  ) {
    return ApiResponse.ok(await this.categoryService.update(storeId, categoryId, dto));
  }

  @Delete('categories/:categoryId')
  async deleteCategory(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('categoryId', ParseIntPipe) categoryId: number,
  ) {
    await this.categoryService.delete(storeId, categoryId);
    return ApiResponse.ok({ deleted: true });
  }
}
