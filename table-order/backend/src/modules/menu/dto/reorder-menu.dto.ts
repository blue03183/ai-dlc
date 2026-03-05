import { IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class MenuOrderItem {
  @IsInt()
  menuId: number;

  @IsInt()
  sortOrder: number;
}

export class ReorderMenuDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuOrderItem)
  items: MenuOrderItem[];
}
