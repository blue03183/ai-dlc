import { IsNotEmpty, IsString, IsEnum, MinLength } from 'class-validator';
import { AdminRole } from '../admin.entity';

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsEnum(AdminRole)
  role: AdminRole;
}
