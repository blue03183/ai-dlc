import { IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class CreateTableDto {
  @IsInt()
  @Min(1)
  tableNumber: number;

  @IsString()
  @MinLength(4)
  @IsNotEmpty()
  password: string;
}
