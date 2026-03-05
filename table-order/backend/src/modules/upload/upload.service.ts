import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
  }

  async deleteImage(filename: string): Promise<void> {
    const filePath = join(this.uploadDir, filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
