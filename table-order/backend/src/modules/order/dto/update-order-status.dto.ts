import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'PREPARING', 'COMPLETED'])
  status: 'PENDING' | 'PREPARING' | 'COMPLETED';
}
