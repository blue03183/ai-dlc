import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu } from './menu.entity';
import { Category } from './category.entity';
import { MenuService } from './menu.service';
import { CategoryService } from './category.service';
import { MenuController } from './menu.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Category])],
  controllers: [MenuController],
  providers: [MenuService, CategoryService],
  exports: [MenuService, CategoryService],
})
export class MenuModule {}
