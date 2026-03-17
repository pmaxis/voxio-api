import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile as UploadedFileDecorator,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from '@/modules/files/service/files.service';
import { CreateFileDto } from '@/modules/files/dto/create-file.dto';
import { UpdateFileDto } from '@/modules/files/dto/update-file.dto';
import type { UploadedFile } from '@/modules/files/types/uploaded-file.interface';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @UploadedFileDecorator(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
      }),
    )
    file: UploadedFile,
    @Body() createFileDto: CreateFileDto,
  ) {
    return this.filesService.create(file, createFileDto);
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}
