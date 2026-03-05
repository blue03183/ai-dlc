import {
  Controller, Post, Delete, Param,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { UploadService } from './upload.service';
import { ApiResponse } from '../../common';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        cb(null, allowed.includes(file.mimetype));
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    return ApiResponse.ok({ url: `/uploads/${file.filename}`, filename: file.filename });
  }

  @Delete(':filename')
  async deleteFile(@Param('filename') filename: string) {
    await this.uploadService.deleteImage(filename);
    return ApiResponse.ok({ deleted: true });
  }
}
