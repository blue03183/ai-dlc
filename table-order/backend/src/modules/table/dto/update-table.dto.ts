import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateTableDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  tableNumber?: number;

  @IsOptional()
  @IsString()
  @MinLength(4)
  password?: string;
}
