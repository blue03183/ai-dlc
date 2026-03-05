import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class TableLoginDto {
  @IsString()
  @IsNotEmpty()
  storeIdentifier: string;

  @IsInt()
  @IsNotEmpty()
  tableNumber: number;

  @IsString()
  @IsNotEmpty()
  password: string;
}
